import type { ImageMetadata } from 'astro';

const contentImages = import.meta.glob<{ default: ImageMetadata }>(
  '../content/**/*.{png,jpg,jpeg,webp,gif}',
  { eager: true }
);

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/\.\//g, '/');
}

function dirname(path: string): string {
  const index = path.lastIndexOf('/');
  return index === -1 ? '' : path.slice(0, index);
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function resolveContentImage(
  collection: string,
  entryId: string,
  imagePath: string
): ImageMetadata | undefined {
  if (!imagePath || /^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('/')) {
    return undefined;
  }

  const entryDir = dirname(entryId);
  const normalizedImagePath = normalizePath(imagePath);
  const key = normalizePath(
    `../content/${collection}/${entryDir ? `${entryDir}/` : ''}${normalizedImagePath}`
  );

  return contentImages[key]?.default;
}

function getFirstMarkdownImagePath(body: string): string | undefined {
  // Matches standard markdown images: ![alt](./image.jpg "optional title")
  const match = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/);
  return match?.[1] ? stripQuotes(match[1]) : undefined;
}

function getFirstMdxComponentImagePath(body: string): string | undefined {
  const imports = new Map<string, string>();
  const importRegex = /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"](\.\.?\/[^'"]+\.(?:png|jpe?g|webp|gif))['"];?/gi;

  for (const match of body.matchAll(importRegex)) {
    imports.set(match[1], match[2]);
  }

  if (imports.size === 0) return undefined;

  // Prefer explicit image components used in the article body.
  const componentRegex = /<\w+[^>]*\bsrc=\{([A-Za-z_$][\w$]*)\}/g;
  for (const match of body.matchAll(componentRegex)) {
    const importedPath = imports.get(match[1]);
    if (importedPath) return importedPath;
  }

  // Fallback to the first local image import.
  return imports.values().next().value;
}

export function getFirstContentImage(
  collection: string,
  entryId: string,
  body: string | undefined
): ImageMetadata | undefined {
  if (!body) return undefined;

  const firstImagePath = getFirstMarkdownImagePath(body) ?? getFirstMdxComponentImagePath(body);
  if (!firstImagePath) return undefined;

  return resolveContentImage(collection, entryId, firstImagePath);
}
