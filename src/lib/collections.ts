import { getCollection, type CollectionEntry } from 'astro:content';
import type { Subject } from '~/data/subjects';
import type { ResourceType } from '~/lib/types';

export type ResourceEntry = CollectionEntry<'resources'>;

export async function getResources(opts?: { includeUnlisted?: boolean }): Promise<ResourceEntry[]> {
  const all = await getCollection('resources');
  // Listing contexts (index, subject, topic, search) get only listed entries.
  // The detail route passes includeUnlisted so unlisted resources still get pages.
  const visible = opts?.includeUnlisted ? all : all.filter(r => !r.data.unlisted);
  return visible.sort((a, b) => +new Date(b.data.addedAt) - +new Date(a.data.addedAt));
}

export async function getResourcesByType(type: ResourceType): Promise<ResourceEntry[]> {
  return (await getResources()).filter(r => r.data.type === type);
}

export async function getRecentResources(limit = 5): Promise<ResourceEntry[]> {
  return (await getResources()).slice(0, limit);
}

export async function getAllTags(): Promise<string[]> {
  const all = await getResources();
  const set = new Set<string>();
  all.forEach(r => r.data.tags.forEach(t => set.add(t)));
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Embedded source for applet / video / quiz entries. */
export function embedSrc(entry: ResourceEntry): string | undefined {
  const d = entry.data;
  if (d.embedUrl) return d.embedUrl;
  if (d.appletFile) {
    return d.appletFile.startsWith('/') ? d.appletFile : `/applets/${d.appletFile}`;
  }
  if (d.fileUrl) {
    return d.fileUrl.startsWith('/') ? d.fileUrl : `/files/${d.fileUrl}`;
  }
  return undefined;
}

/** Direct download / external link for file entries. */
export function fileHref(entry: ResourceEntry): string {
  const d = entry.data;
  if (d.externalUrl) return d.externalUrl;
  const f = d.fileUrl ?? '';
  return f.startsWith('/') ? f : `/files/${f}`;
}

/** Where this resource is linked from cards / rows. Files link directly; everything else opens the detail page. */
export function resourceHref(entry: ResourceEntry): string {
  if (entry.data.type === 'file') return fileHref(entry);
  return `/resources/r/${entry.slug}`;
}

export function isExternalHref(entry: ResourceEntry): boolean {
  return entry.data.type === 'file' && Boolean(entry.data.externalUrl);
}

export async function getTopicsForSubject(subject: Subject): Promise<string[]> {
  const all = await getResources();
  const set = new Set<string>();
  for (const r of all) {
    if (r.data.subject !== subject) continue;
    const t = topicFor(r);
    if (t) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function getSubjectTopicTree(): Promise<Record<Subject, string[]>> {
  const all = await getResources();
  const tree: Record<string, Set<string>> = {};
  for (const r of all) {
    const t = topicFor(r);
    if (!t) continue;
    (tree[r.data.subject] ??= new Set()).add(t);
  }
  const out: Record<string, string[]> = {};
  for (const [subj, topics] of Object.entries(tree)) {
    out[subj] = [...topics].sort();
  }
  return out as Record<Subject, string[]>;
}

/** Resources without an explicit `topic` fall back to their first tag, mirroring the old applet→topic-by-tag behavior. */
export function topicFor(entry: ResourceEntry): string | undefined {
  return entry.data.topic ?? entry.data.tags[0];
}

export function topicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
