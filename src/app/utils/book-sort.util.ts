import { Book, BookSortMode } from '../models/book.model';

export const SORT_MODE_CYCLE: readonly BookSortMode[] = [
  'default',
  'authorGroup',
  'title',
];

export function sortBooksByTitle(books: readonly Book[]): Book[] {
  return [...books].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );
}

export function sortBooksByAuthorGroup(books: readonly Book[]): Book[] {
  return [...books].sort((a, b) => {
    const authorCompare = a.author.localeCompare(b.author, undefined, { sensitivity: 'base' });
    if (authorCompare !== 0) {
      return authorCompare;
    }

    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
}

export function applyBookSort(
  books: readonly Book[],
  mode: BookSortMode,
): Book[] {
  switch (mode) {
    case 'title':
      return sortBooksByTitle(books);
    case 'authorGroup':
      return sortBooksByAuthorGroup(books);
    default:
      return [...books];
  }
}

export function getNextSortMode(mode: BookSortMode): BookSortMode {
  const index = SORT_MODE_CYCLE.indexOf(mode);
  return SORT_MODE_CYCLE[(index + 1) % SORT_MODE_CYCLE.length];
}

export function getSortModeLabel(mode: BookSortMode): string {
  switch (mode) {
    case 'title':
      return 'Sort By Title';
    case 'authorGroup':
      return 'Sort By Author Group';
    default:
      return 'Sort';
  }
}

export function getSortModeMessage(mode: BookSortMode): string {
  switch (mode) {
    case 'title':
      return 'Books sorted by title.';
    case 'authorGroup':
      return 'Books sorted by author group.';
    default:
      return 'Showing books in default order.';
  }
}
