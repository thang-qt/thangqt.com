import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import { getPublishedWriting } from '../utils/collections';

export async function GET(context: APIContext) {
  const sortedPosts = await getPublishedWriting();

  // Create container for rendering content
  const container = await AstroContainer.create({
    renderers: [await getMDXRenderer()],
  });

  // Render each post's content
  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      const { Content } = await post.render();
      const content = await container.renderToString(Content);

      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description || post.data.title,
        link: `/writing/${post.slug}/`,
        categories: post.data.tags || [],
        content,
      };
    })
  );

  return rss({
    title: "ThangQT's Writing",
    description: 'My various thoughts on life, tech, and everything in between',
    site: context.site ?? 'https://thangqt.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
