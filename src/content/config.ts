import { defineCollection, z } from 'astro:content';

const linkVia = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('internal'),
    slug: z.string(),
  }),
  z.object({
    type: z.literal('external'),
    url: z.string().url(),
    title: z.string().optional(),
  }),
]);

const writing = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      updated: z.date().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      cover: image().optional(),
      seoImage: image().optional(),
      contentBackground: z.string().optional(),
      themeColor: z.string().optional(),
      themeColorDark: z.string().optional(),
      draft: z.boolean().optional().default(false),
    }),
});

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.string(),
      description: z.string().optional(),
      cover: image().optional(),
      seoImage: image().optional(),
      themeColor: z.string().optional(),
      themeColorDark: z.string().optional(),
      draft: z.boolean().optional().default(false),
    }),
});

const links = defineCollection({
  type: 'content',
  schema: z.object({
    url: z.string().url(),
    title: z.string().optional(),
    date: z.date().optional(),
    order: z.number().int().optional(),
    note: z.string().optional(),
    archiveUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    kind: z.enum(['article', 'video', 'repo', 'tool', 'paper', 'thread', 'podcast', 'portfolio', 'index']).optional(),
    via: z.array(linkVia).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

const chitchat = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    tags: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string().optional(),
        }),
      )
      .optional()
      .default([]),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { writing, projects, links, chitchat };
