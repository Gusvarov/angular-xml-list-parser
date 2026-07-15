import { describe, expect, it } from 'vitest';

import { Book } from '../models/book.model';
import { searchBooksByTitle } from './book-search.util';

describe('searchBooksByTitle', () => {
  const books: Book[] = [
    { id: '1', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
    { id: '2', title: 'The Shining', author: 'King', pages: 447 },
    { id: '3', title: 'It', author: 'King', pages: 1138 },
  ];

  it('returns all books when the query is empty', () => {
    expect(searchBooksByTitle(books, '')).toEqual(books);
    expect(searchBooksByTitle(books, '   ')).toEqual(books);
  });

  it('filters by partial title match', () => {
    const filtered = searchBooksByTitle(books, 'the');

    expect(filtered.map((book) => book.title)).toEqual([
      'The Little Mermaid',
      'The Shining',
    ]);
  });

  it('matches case-insensitively', () => {
    const filtered = searchBooksByTitle(books, 'SHIN');

    expect(filtered).toEqual([books[1]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchBooksByTitle(books, 'nonexistent')).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const copy = [...books];
    searchBooksByTitle(books, 'the');

    expect(books).toEqual(copy);
  });
});
