import { getCollection, type CollectionEntry } from 'astro:content';

const BLUESKY_HANDLE = 'thangqt.com';
const BLUESKY_AUTHOR_FEED_URL = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed';
const BLUESKY_FETCH_LIMIT = 100;
const BLUESKY_TIMEOUT_MS = 8000;

export const CHITCHAT_PAGE_SIZE = 20;

interface BlueskyFacet {
  features?: Array<{ $type?: string; tag?: string }>;
}

interface BlueskyImageView {
  alt?: string;
  fullsize?: string;
  thumb?: string;
}

interface BlueskyExternalView {
  uri?: string;
  title?: string;
  description?: string;
  thumb?: string;
}

interface BlueskyEmbedView {
  $type?: string;
  images?: BlueskyImageView[];
  external?: BlueskyExternalView;
  media?: BlueskyEmbedView;
}

interface BlueskyPostRecord {
  $type?: string;
  text?: string;
  createdAt?: string;
  reply?: unknown;
  tags?: string[];
  facets?: BlueskyFacet[];
}

interface BlueskyPostView {
  uri: string;
  record?: BlueskyPostRecord;
  embed?: BlueskyEmbedView;
}

interface BlueskyAuthorFeedItem {
  post?: BlueskyPostView;
  reason?: unknown;
}

interface BlueskyAuthorFeedResponse {
  feed?: BlueskyAuthorFeedItem[];
}

export interface ChitchatImage {
  src: string;
  alt?: string;
}

export interface ChitchatExternalCard {
  uri: string;
  title?: string;
  description?: string;
  thumb?: string;
}

export type ChitchatFeedItem =
  | {
      source: 'local';
      slug: string;
      date: Date;
      post: CollectionEntry<'chitchat'>;
      permalink: string;
      tags: string[];
    }
  | {
      source: 'bluesky';
      id: string;
      date: Date;
      text: string;
      permalink: string;
      blueskyUrl: string;
      tags: string[];
      images: ChitchatImage[];
      external?: ChitchatExternalCard;
    };

let blueskyPostsPromise: Promise<ChitchatFeedItem[]> | undefined;
let mergedPostsPromise: Promise<ChitchatFeedItem[]> | undefined;

function getBlueskyPostUrl(uri: string) {
  const rkey = uri.split('/').at(-1);
  return rkey
    ? `https://bsky.app/profile/${BLUESKY_HANDLE}/post/${rkey}`
    : `https://bsky.app/profile/${BLUESKY_HANDLE}`;
}

function getBlueskyPostId(uri: string) {
  return `bsky-${uri.split('/').at(-1) ?? encodeURIComponent(uri)}`;
}

function getFacetTags(facets: BlueskyFacet[] | undefined) {
  return (
    facets
      ?.flatMap((facet) => facet.features ?? [])
      .filter((feature) => feature.$type === 'app.bsky.richtext.facet#tag' && feature.tag)
      .map((feature) => feature.tag as string) ?? []
  );
}

function getTextTags(text: string) {
  return Array.from(text.matchAll(/(?:^|\s)#([\p{L}\p{N}_-]+)/gu), (match) => match[1]);
}

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function getEmbedImages(embed: BlueskyEmbedView | undefined): ChitchatImage[] {
  const imageEmbed = embed?.images ? embed : embed?.media?.images ? embed.media : undefined;

  return (
    imageEmbed?.images
      ?.map((image) => ({
        src: image.fullsize ?? image.thumb ?? '',
        alt: image.alt,
      }))
      .filter((image) => image.src.length > 0) ?? []
  );
}

function getEmbedExternal(embed: BlueskyEmbedView | undefined): ChitchatExternalCard | undefined {
  const external = embed?.external ?? embed?.media?.external;
  if (!external?.uri) return undefined;

  return {
    uri: external.uri,
    title: external.title,
    description: external.description,
    thumb: external.thumb,
  };
}

function parseBlueskyPost(item: BlueskyAuthorFeedItem): ChitchatFeedItem | undefined {
  if (item.reason) return undefined;

  const post = item.post;
  const record = post?.record;
  if (!post?.uri || record?.$type !== 'app.bsky.feed.post' || !record.createdAt) return undefined;
  if (record.reply) return undefined;

  const date = new Date(record.createdAt);
  if (Number.isNaN(date.getTime())) return undefined;

  const text = record.text ?? '';
  const id = getBlueskyPostId(post.uri);

  return {
    source: 'bluesky',
    id,
    date,
    text,
    permalink: `/chitchat/${id}`,
    blueskyUrl: getBlueskyPostUrl(post.uri),
    tags: uniqueTags([
      ...(record.tags ?? []),
      ...getFacetTags(record.facets),
      ...getTextTags(text),
    ]),
    images: getEmbedImages(post.embed),
    external: getEmbedExternal(post.embed),
  };
}

async function fetchJsonWithTimeout(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BLUESKY_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Bluesky request failed with ${response.status}`);
    return (await response.json()) as BlueskyAuthorFeedResponse;
  } finally {
    clearTimeout(timeout);
  }
}

export function getBlueskyChitchatPosts() {
  blueskyPostsPromise ??= (async () => {
    const url = new URL(BLUESKY_AUTHOR_FEED_URL);
    url.searchParams.set('actor', BLUESKY_HANDLE);
    url.searchParams.set('filter', 'posts_no_replies');
    url.searchParams.set('limit', String(BLUESKY_FETCH_LIMIT));

    try {
      const data = await fetchJsonWithTimeout(url);
      return (data.feed ?? [])
        .map(parseBlueskyPost)
        .filter((post): post is ChitchatFeedItem => Boolean(post));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[chitchat] Could not fetch Bluesky posts for ${BLUESKY_HANDLE}: ${message}`);
      return [];
    }
  })();

  return blueskyPostsPromise;
}

export async function getLocalChitchatPosts() {
  const posts = await getCollection('chitchat');

  return posts
    .filter((post) => !post.data.draft)
    .map(
      (post): ChitchatFeedItem => ({
        source: 'local',
        slug: post.slug,
        date: post.data.date,
        post,
        permalink: `/chitchat/${post.slug}`,
        tags: post.data.tags,
      }),
    );
}

export function getMergedChitchatPosts() {
  mergedPostsPromise ??= Promise.all([getLocalChitchatPosts(), getBlueskyChitchatPosts()]).then(
    ([localPosts, blueskyPosts]) =>
      [...localPosts, ...blueskyPosts].sort((a, b) => b.date.getTime() - a.date.getTime()),
  );

  return mergedPostsPromise;
}
