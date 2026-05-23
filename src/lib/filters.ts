import type { ResourceEntry } from './collections';
import type { ResourceType } from '~/lib/types';
import type { Subject } from '~/data/subjects';
import type { YearLevel } from '~/data/yearLevels';

export type FilterState = {
  subjects: Set<Subject>;
  types: Set<ResourceType>;
  years: Set<YearLevel>;
  tags: Set<string>;
};

export function emptyFilter(): FilterState {
  return { subjects: new Set(), types: new Set(), years: new Set(), tags: new Set() };
}

export function matches(entry: ResourceEntry, f: FilterState): boolean {
  if (f.subjects.size && !f.subjects.has(entry.data.subject)) return false;
  if (f.types.size && !f.types.has(entry.data.type)) return false;
  if (f.years.size && !entry.data.yearLevel.some(y => f.years.has(y as YearLevel))) return false;
  if (f.tags.size && !entry.data.tags.some(t => f.tags.has(t))) return false;
  return true;
}

export function filterResources(resources: ResourceEntry[], f: FilterState): ResourceEntry[] {
  return resources.filter(r => matches(r, f));
}
