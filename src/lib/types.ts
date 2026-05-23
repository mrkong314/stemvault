import type { Subject } from '~/data/subjects';
import type { YearLevel } from '~/data/yearLevels';

export type ResourceType = 'applet' | 'file' | 'video' | 'quiz';
export type FileFormat = 'pdf' | 'ppt' | 'doc' | 'link';

export type FilterState = {
  subjects: Set<Subject>;
  years: Set<YearLevel>;
  tags: Set<string>;
  types: Set<ResourceType>;
  tagQuery: string;
};

export const TYPE_LABEL: Record<ResourceType, string> = {
  applet: 'Applet',
  file: 'File',
  video: 'Video',
  quiz: 'Quiz',
};

export const FORMAT_LABEL: Record<FileFormat, string> = {
  pdf: 'PDF',
  ppt: 'Powerpoint',
  doc: 'Word Doc',
  link: 'External Link',
};
