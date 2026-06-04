export const WRITING_PAGE_SIZE = 40;
export const PROJECTS_PAGE_SIZE = 12;
export const LINKS_PAGE_SIZE = 12;

export interface PaginationData<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export function paginateItems<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
): PaginationData<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(totalItems, start + pageSize);

  return {
    items: items.slice(start, end),
    currentPage: safePage,
    totalPages,
    totalItems,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: end,
  };
}

export function buildPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

export function getPaginationStaticPaths(totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    params: { page: String(index + 2) },
  }));
}

export function parsePageParam(page: string | number | undefined) {
  const parsedPage = Number(page);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getPageNumbers(totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function getCompactPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return getPageNumbers(totalPages).map((page) => ({ type: 'page' as const, page }));
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 2) pages.add(currentPage - 1);
  if (currentPage < totalPages - 1) pages.add(currentPage + 1);
  if (currentPage === 1) pages.add(2);
  if (currentPage === totalPages) pages.add(totalPages - 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const items: Array<{ type: 'page'; page: number } | { type: 'ellipsis'; key: string }> = [];

  sortedPages.forEach((page, index) => {
    if (index > 0) {
      const previousPage = sortedPages[index - 1];
      if (page - previousPage > 1) {
        items.push({ type: 'ellipsis', key: `${previousPage}-${page}` });
      }
    }

    items.push({ type: 'page', page });
  });

  return items;
}
