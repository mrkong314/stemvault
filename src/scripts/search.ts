// Lightweight client-side search.
// Lazy-loads /search-index.json on first focus, then substring-matches title + tags.

type ResourceType = 'applet' | 'file' | 'video' | 'quiz' | 'tool';

type Row = {
  title: string;
  tags: string[];
  subject: string;
  type: ResourceType;
  url: string;
};

const TYPES: ResourceType[] = ['applet', 'quiz', 'file', 'video', 'tool'];

let cache: Indexed[] | null = null;
let inFlight: Promise<Indexed[]> | null = null;

async function loadIndex(): Promise<Indexed[]> {
  if (cache) return cache;
  if (inFlight) return inFlight;
  inFlight = fetch('/search-index.json')
    .then(r => r.ok ? r.json() : [])
    .then((rows: Row[]) => { cache = rows.map(index); return cache; })
    .catch(() => []);
  return inFlight;
}

/* ---- Fuzzy matching ----
 * Every word of the query must match the row somehow; rows are ranked by how well.
 * A word matches by (best first): whole query as a phrase in the title, substring of
 * the title, substring of a tag or the subject, a small edit distance from any word
 * (typos such as "kinmatics" or "photoelctric"), or its letters appearing in order
 * inside a word ("pte" for "periodic table" is not enough, but "phtoelec" is).
 */
const WORD_RE = /[^a-z0-9]+/;

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Damerau-Levenshtein distance, capped at `max + 1` for speed. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = []; let prev: number[] = []; let cur: number[] = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur = [i]; let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v; if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev); prev = cur;
  }
  return prev[b.length];
}

function isSubsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) if (hay[j] === needle[i]) i++;
  return i === needle.length;
}

type Indexed = Row & { _title: string; _words: string[]; _tagText: string };

function index(row: Row): Indexed {
  const title = norm(row.title);
  const tagText = norm([...row.tags, row.subject].join(' '));
  const words = [...new Set([...title.split(WORD_RE), ...tagText.split(WORD_RE)].filter(Boolean))];
  return { ...row, _title: title, _words: words, _tagText: tagText };
}

function tokenScore(row: Indexed, t: string): number {
  if (row._title.includes(t)) return row._title.startsWith(t) || row._title.includes(' ' + t) ? 12 : 10;
  if (row._tagText.includes(t)) return 6;
  const allow = t.length >= 6 ? 2 : t.length >= 4 ? 1 : 0;
  let best = 0;
  for (const w of row._words) {
    if (allow && w.length >= 3) {
      const d = editDistance(t, w, allow);
      if (d <= allow) best = Math.max(best, 5 - d);
      else if (w.length > t.length && editDistance(t, w.slice(0, t.length), allow) <= allow) best = Math.max(best, 3);
    }
    if (t.length >= 4 && w.length >= t.length && isSubsequence(t, w)) best = Math.max(best, 2);
  }
  return best;
}

function score(row: Indexed, q: string): number {
  const query = norm(q).trim();
  if (!query) return 0;
  const tokens = query.split(WORD_RE).filter(Boolean);
  let total = row._title.includes(query) ? 8 : 0;
  for (const t of tokens) {
    const s = tokenScore(row, t);
    if (s === 0) return 0;
    total += s;
  }
  return total;
}

function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function render(rows: Indexed[], q: string) {
  const dropdown = document.getElementById('svault-search-results');
  if (!dropdown) return;
  const empty = dropdown.querySelector('[data-empty]') as HTMLElement;
  const groups = dropdown.querySelectorAll<HTMLElement>('.search-group');

  if (!q.trim()) {
    empty.textContent = 'Start typing to search.';
    empty.hidden = false;
    groups.forEach(g => (g.hidden = true));
    return;
  }

  const filtered = rows
    .map(r => ({ r, s: score(r, q) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s || a.r.title.localeCompare(b.r.title))
    .map(x => x.r);
  const byType: Record<ResourceType, Indexed[]> = { applet: [], file: [], video: [], quiz: [], tool: [] };
  for (const r of filtered) (byType[r.type] ??= []).push(r);

  if (filtered.length === 0) {
    empty.textContent = `No matches for "${q}".`;
    empty.hidden = false;
    groups.forEach(g => (g.hidden = true));
    return;
  }
  empty.hidden = true;

  for (const kind of TYPES) {
    const items = byType[kind];
    const group = dropdown.querySelector<HTMLElement>(`.search-group[data-group="${kind}"]`);
    const list = dropdown.querySelector<HTMLUListElement>(`ul[data-list="${kind}"]`);
    if (!group || !list) continue;
    if (items.length === 0) {
      group.hidden = true;
      continue;
    }
    group.hidden = false;
    list.innerHTML = items.slice(0, 8).map(r => `
      <li><a href="${escapeHTML(r.url)}">
        <span class="search-title">${escapeHTML(r.title)}</span>
        <span class="search-sub">${escapeHTML(r.subject)}${r.tags.length ? ' · ' + escapeHTML(r.tags.slice(0, 3).join(', ')) : ''}</span>
      </a></li>
    `).join('');
  }
}

function wire() {
  const root = document.getElementById('svault-search');
  const input = document.getElementById('svault-search-input') as HTMLInputElement | null;
  const dropdown = document.getElementById('svault-search-results');
  if (!root || !input || !dropdown) return;

  let loaded = false;
  const ensureLoaded = async () => {
    if (loaded) return;
    loaded = true;
    await loadIndex();
    render(cache ?? [], input.value);
  };

  input.addEventListener('focus', () => {
    dropdown.hidden = false;
    ensureLoaded();
  });
  input.addEventListener('input', async () => {
    dropdown.hidden = false;
    if (!loaded) await ensureLoaded();
    render(cache ?? [], input.value);
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target as Node)) dropdown.hidden = true;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.blur();
      dropdown.hidden = true;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wire);
} else {
  wire();
}

// Module scope: keeps these helpers out of the global script namespace.
export {};
