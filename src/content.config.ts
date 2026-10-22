import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Textos legales en Markdown: se editan sin tocar código y se validan al compilar.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string().max(170),
    updated: z.coerce.date(),
    breadcrumb: z.string(),
  }),
});

export const collections = { legal };
