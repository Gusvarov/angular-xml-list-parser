import { Book } from '../models/book.model';

export function searchBooksByTitle(
  books: readonly Book[],
  query: string,
): Book[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [...books];
  }

  return books.filter((book) => book.title.toLowerCase().includes(normalizedQuery));
}
