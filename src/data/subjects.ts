export const SUBJECTS = [
  { name: 'Mathematics', slug: 'mathematics', accent: '#1f5d4c' },
  { name: 'Chemistry', slug: 'chemistry', accent: '#c97a28' },
  { name: 'Physics', slug: 'physics', accent: '#2d6a8f' },
  { name: 'Biology', slug: 'biology', accent: '#6b8b3a' },
] as const;

export type Subject = (typeof SUBJECTS)[number]['name'];
export type SubjectSlug = (typeof SUBJECTS)[number]['slug'];

export const SUBJECT_NAMES = SUBJECTS.map(s => s.name) as Subject[];

export function subjectFromSlug(slug: string) {
  return SUBJECTS.find(s => s.slug === slug);
}

export function slugForSubject(name: Subject) {
  return SUBJECTS.find(s => s.name === name)?.slug ?? name.toLowerCase();
}
