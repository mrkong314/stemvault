export const SUBJECTS = [
  { name: 'Mathematics', slug: 'mathematics', accent: '#30d158' },
  { name: 'Chemistry', slug: 'chemistry', accent: '#ff9f0a' },
  { name: 'Physics', slug: 'physics', accent: '#0a84ff' },
  { name: 'Biology', slug: 'biology', accent: '#bf5af2' },
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
