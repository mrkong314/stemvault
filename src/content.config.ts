import { defineCollection, z } from 'astro:content';
import { SUBJECT_NAMES } from '~/data/subjects';
import { YEAR_LEVELS } from '~/data/yearLevels';

const subjectEnum = z.enum(SUBJECT_NAMES as [string, ...string[]]);
const yearSchema = z.array(z.number().int().refine(n => (YEAR_LEVELS as readonly number[]).includes(n), {
  message: `Year must be one of ${YEAR_LEVELS.join(', ')}`,
}));

const typeEnum = z.enum(['applet', 'file', 'video', 'quiz']);
const formatEnum = z.enum(['pdf', 'ppt', 'doc', 'link']);

const resources = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: typeEnum,
    subject: subjectEnum,
    yearLevel: yearSchema,
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    topic: z.string().optional(),
    addedAt: z.coerce.date(),
    featured: z.boolean().default(false),

    // applet / video / quiz embed sources
    embedUrl: z.string().url().optional(),
    appletFile: z.string().optional(),

    // file-specific
    format: formatEnum.optional(),
    fileUrl: z.string().optional(),
    externalUrl: z.string().url().optional(),
    sourceNote: z.string().optional(),
  }).superRefine((d, ctx) => {
    if (d.type === 'applet') {
      if (!d.embedUrl && !d.appletFile) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Applet requires embedUrl or appletFile', path: ['embedUrl'] });
      }
    } else if (d.type === 'file') {
      if (!d.format) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'File requires format (pdf|ppt|doc|link)', path: ['format'] });
      }
      if (!d.fileUrl && !d.externalUrl) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'File requires fileUrl or externalUrl', path: ['fileUrl'] });
      }
    } else if (d.type === 'video') {
      if (!d.embedUrl && !d.externalUrl) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Video requires embedUrl or externalUrl', path: ['embedUrl'] });
      }
    } else if (d.type === 'quiz') {
      if (!d.appletFile && !d.fileUrl && !d.embedUrl) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Quiz requires appletFile, fileUrl, or embedUrl', path: ['appletFile'] });
      }
    }
  }),
});

export const collections = { resources };
