import type { APIRoute } from 'astro';
import { getResources, resourceHref } from '~/lib/collections';

export const GET: APIRoute = async () => {
  const resources = await getResources();
  const rows = resources.map(r => ({
    title: r.data.title,
    tags: r.data.tags,
    subject: r.data.subject,
    type: r.data.type,
    url: resourceHref(r),
  }));

  return new Response(JSON.stringify(rows), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
