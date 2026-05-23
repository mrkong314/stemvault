// Client-side filter panel logic.
// Reads checked chips/checkboxes, finds the target items via `data-target` selector,
// and toggles hidden based on data-subject / data-years / data-tags / data-type / data-title.

type FilterValues = {
  subjects: Set<string>;
  years: Set<string>;
  tags: Set<string>;
  types: Set<string>;
  query: string;
};

function readPanel(panel: HTMLElement): FilterValues {
  const get = (name: string) =>
    new Set(
      Array.from(panel.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`))
        .map(i => i.value),
    );
  const q = panel.querySelector<HTMLInputElement>('input[data-filter-query]');
  return {
    subjects: get('subject'),
    years: get('year'),
    tags: get('tag'),
    types: get('type'),
    query: (q?.value ?? '').trim().toLowerCase(),
  };
}

function matches(item: HTMLElement, f: FilterValues): boolean {
  if (f.subjects.size) {
    const subj = item.dataset.subject ?? '';
    if (!f.subjects.has(subj)) return false;
  }
  if (f.types.size) {
    const t = item.dataset.type ?? '';
    if (!f.types.has(t)) return false;
  }
  if (f.years.size) {
    const itemYears = (item.dataset.years ?? '').split(',').map(s => s.trim()).filter(Boolean);
    if (!itemYears.some(y => f.years.has(y))) return false;
  }
  if (f.tags.size) {
    const itemTags = (item.dataset.tags ?? '').split('|').map(s => s.trim()).filter(Boolean);
    if (!itemTags.some(t => f.tags.has(t))) return false;
  }
  if (f.query) {
    const title = (item.dataset.title ?? '').toLowerCase();
    const tagsBlob = (item.dataset.tags ?? '').toLowerCase();
    if (!title.includes(f.query) && !tagsBlob.includes(f.query)) return false;
  }
  return true;
}

function wire(panel: HTMLElement) {
  const targetSel = panel.dataset.target;
  if (!targetSel) return;
  const countEl = panel.querySelector<HTMLElement>('[data-filter-count]');
  const clearBtn = panel.querySelector<HTMLButtonElement>('[data-filter-clear]');

  const apply = () => {
    const f = readPanel(panel);
    const items = document.querySelectorAll<HTMLElement>(targetSel);
    let visible = 0;
    items.forEach(item => {
      const ok = matches(item, f);
      item.dataset.filterHidden = ok ? '' : '1';
      item.hidden = item.dataset.filterHidden === '1' || item.dataset.tabHidden === '1';
      if (!item.hidden) visible++;
    });
    if (countEl) {
      countEl.textContent = `${visible} / ${items.length} showing`;
    }
    document
      .querySelectorAll<HTMLElement>(`[data-empty-for="${CSS.escape(targetSel)}"]`)
      .forEach(el => (el.hidden = visible !== 0));
  };

  panel.addEventListener('change', apply);
  panel.addEventListener('input', apply);
  clearBtn?.addEventListener('click', () => {
    panel.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(c => (c.checked = false));
    panel.querySelectorAll<HTMLInputElement>('input[type="search"]').forEach(s => {
      s.value = '';
    });
    apply();
  });

  apply();
}

function init() {
  document.querySelectorAll<HTMLElement>('[data-filter-panel]').forEach(wire);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
