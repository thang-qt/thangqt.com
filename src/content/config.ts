import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    coverMode: z.enum(['inline', 'title-background']).optional(),
    contentBackground: z.string().optional(),
    themeColor: z.string().optional(),
    themeColorDark: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { writing, projects };
