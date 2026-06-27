import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const posts = import.meta.glob('/src/content/posts/*.md');
  const match = posts[`/src/content/posts/${params.slug}.md`];
  if (!match) throw new Error(`No post: ${params.slug}`);
  const post = await match() as { default: unknown; metadata: Record<string, string> };
  return {
    content: post.default,
    metadata: post.metadata
  };
};
