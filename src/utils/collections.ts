import { getCollection, type CollectionEntry } from 'astro:content';

export type WritingEntry = CollectionEntry<'writing'>;
export type ProjectEntry = CollectionEntry<'projects'>;

type DraftableData = { draft?: boolean };

export function isPublishedContent(data: DraftableData) {
  return import.meta.env.PROD ? data.draft !== true : true;
}

export function compareWritingNewest(a: WritingEntry, b: WritingEntry) {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

export function getProjectSortKey(value: string) {
  return value.includes('-') ? value : `${value}-00`;
}

export function compareProjectsNewest(a: ProjectEntry, b: ProjectEntry) {
  return getProjectSortKey(b.data.year).localeCompare(getProjectSortKey(a.data.year));
}

export async function getPublishedWriting() {
  const posts = await getCollection('writing', ({ data }) => isPublishedContent(data));
  return [...posts].sort(compareWritingNewest);
}

export async function getPublishedProjects() {
  const projects = await getCollection('projects', ({ data }) => isPublishedContent(data));
  return [...projects].sort(compareProjectsNewest);
}
