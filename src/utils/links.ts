import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublishedContent } from './collections';

export type LinkEntry = CollectionEntry<'links'>;
export type LinkVia = LinkEntry['data']['via'][number];

export interface ResolvedInternalVia {
  type: 'internal';
  slug: string;
  href: string;
  label: string;
}

export interface ResolvedExternalVia {
  type: 'external';
  href: string;
  label: string;
}

export type ResolvedVia = ResolvedInternalVia | ResolvedExternalVia;

export async function getPublishedLinks() {
  const links = await getCollection('links', ({ data }) => isPublishedContent(data));

  const slugMap = new Map<string, LinkEntry>();

  for (const link of links) {
    const existing = slugMap.get(link.slug);

    if (existing) {
      throw new Error(
        `Duplicate link slug \"${link.slug}\" found in \"${existing.id}\" and \"${link.id}\".`
      );
    }

    slugMap.set(link.slug, link);
  }

  const sortedLinks = [...links].sort((a, b) => {
    const dateDiff = (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0);

    if (dateDiff !== 0) return dateDiff;

    const orderDiff = (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER);

    if (orderDiff !== 0) return orderDiff;

    return a.slug.localeCompare(b.slug);
  });

  return { links: sortedLinks, slugMap };
}

export function getLinkHref(link: LinkEntry) {
  return `/links/${link.slug}`;
}

export function getLinkTitle(link: LinkEntry) {
  return link.data.title?.trim() || getHostnameLabel(link.data.url);
}

export function getHostnameLabel(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname || url;
  } catch {
    return url;
  }
}

export function getDisplayUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function formatLinkDate(date?: Date) {
  if (!date) return null;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLinkKind(kind?: string) {
  if (!kind) return null;
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function resolveVia(via: LinkEntry['data']['via'], slugMap: Map<string, LinkEntry>): ResolvedVia[] {
  return via.map((item) => {
    if (item.type === 'internal') {
      const referenced = slugMap.get(item.slug);

      return {
        type: 'internal',
        slug: item.slug,
        href: `/links/${item.slug}`,
        label: referenced ? getLinkTitle(referenced) : item.slug,
      } satisfies ResolvedInternalVia;
    }

    return {
      type: 'external',
      href: item.url,
      label: item.title?.trim() || getHostnameLabel(item.url),
    } satisfies ResolvedExternalVia;
  });
}

export function hasRenderableLinkBody(link: { body?: string }) {
  return Boolean(link.body?.trim());
}
