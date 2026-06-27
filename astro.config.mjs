// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://thangqt.com',
  output: 'static',
  redirects: {
    '/writing/hometown': '/chitchat/hometown',
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  integrations: [
    mdx(),
    icon({
      include: {
        ph: [
          'house',
          'pencil-simple',
          'cube',
          'link',
          'info',
          'file-text',
          'gear',
          'chat-circle',
          'users-three',
          'terminal',
          'heart',
          'paper-plane-tilt',
          'broom',
        ],
      },
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'rose-pine-dawn',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
