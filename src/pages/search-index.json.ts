import type { APIRoute } from 'astro';
import { getResources, resourceHref } from '~/lib/collections';
import { TOOLS } from '~/data/tools';

export const GET: APIRoute = async () => {
  const resources = await getResources();
  const rows: { title: string; tags: string[]; subject: string; type: string; url: string }[] = resources.map(r => ({
    title: r.data.title,
    tags: r.data.tags,
    subject: r.data.subject,
    type: r.data.type,
    url: resourceHref(r),
  }));
  // Tools are searchable too, under their own group.
  for (const t of TOOLS) {
    rows.push({ title: t.title, tags: [], subject: 'Tool', type: 'tool', url: t.href });
  }

  return new Response(JSON.stringify(rows), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
