import type { PageLoad } from './$types';

type PostMeta = {
  title: string;
  date: string;
  description?: string;
};

export const load: PageLoad = async () => {
  const modules = import.meta.glob<{ metadata: PostMeta }>('/src/content/posts/*.md');
  const posts = await Promise.all(
    Object.entries(modules).map(async ([path, resolver]) => {
      const { metadata } = await resolver();
      const slug = path.split('/').at(-1)!.replace('.md', '');
      return { slug, ...metadata };
    })
  );
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { posts };
};
