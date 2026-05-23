// Lightweight client-side search.
// Lazy-loads /search-index.json on first focus, then substring-matches title + tags.

type ResourceType = 'applet' | 'file' | 'video' | 'quiz';

type Row = {
  title: string;
  tags: string[];
  subject: string;
  type: ResourceType;
  url: string;
};

const TYPES: ResourceType[] = ['applet', 'file', 'video', 'quiz'];

let cache: Row[] | null = null;
let inFlight: Promise<Row[]> | null = null;

async function loadIndex(): Promise<Row[]> {
  if (cache) return cache;
  if (inFlight) return inFlight;
  inFlight = fetch('/search-index.json')
    .then(r => r.ok ? r.json() : [])
    .then((rows: Row[]) => { cache = rows; return rows; })
    .catch(() => []);
  return inFlight;
}

function match(row: Row, q: string): boolean {
  const needle = q.toLowerCase();
  if (row.title.toLowerCase().includes(needle)) return true;
  return row.tags.some(t => t.toLowerCase().includes(needle));
}

function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function render(rows: Row[], q: string) {
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

  const filtered = rows.filter(r => match(r, q));
  const byType: Record<ResourceType, Row[]> = { applet: [], file: [], video: [], quiz: [] };
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
