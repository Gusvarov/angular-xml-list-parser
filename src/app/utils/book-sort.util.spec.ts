import { describe, expect, it } from 'vitest';

import { Book } from '../models/book.model';
import {
  applyBookSort,
  getNextSortMode,
  getSortModeLabel,
  getSortModeMessage,
  sortBooksByAuthorGroup,
  sortBooksByTitle,
  SORT_MODE_CYCLE,
} from './book-sort.util';

describe('sortBooksByTitle', () => {
  const books: Book[] = [
    { id: '1', title: 'The Shining', author: 'King', pages: 447 },
    { id: '2', title: 'It', author: 'King', pages: 1138 },
    { id: '3', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
  ];

  it('sorts books alphabetically by title', () => {
    const sorted = sortBooksByTitle(books);

    expect(sorted.map((book) => book.title)).toEqual([
      'It',
      'The Little Mermaid',
      'The Shining',
    ]);
  });

  it('does not mutate the original array', () => {
    const originalOrder = books.map((book) => book.id);
    sortBooksByTitle(books);

    expect(books.map((book) => book.id)).toEqual(originalOrder);
  });
});

describe('sortBooksByAuthorGroup', () => {
  const books: Book[] = [
    { id: '1', title: 'The Shining', author: 'King', pages: 447 },
    { id: '2', title: 'The Ugly Duckling', author: 'Andersen', pages: 32 },
    { id: '3', title: 'It', author: 'King', pages: 1138 },
    { id: '4', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
  ];

  it('sorts books alphabetically by author group', () => {
    const sorted = sortBooksByAuthorGroup(books);

    expect(sorted.map((book) => `${book.author} - ${book.title}`)).toEqual([
      'Andersen - The Little Mermaid',
      'Andersen - The Ugly Duckling',
      'King - It',
      'King - The Shining',
    ]);
  });

  it('does not mutate the original array', () => {
    const originalOrder = books.map((book) => book.id);
    sortBooksByAuthorGroup(books);

    expect(books.map((book) => book.id)).toEqual(originalOrder);
  });

  it('sorts case-insensitively', () => {
    const mixedCase: Book[] = [
      { id: '1', title: 'zebra', author: 'smith', pages: 10 },
      { id: '2', title: 'Apple', author: 'Adams', pages: 20 },
      { id: '3', title: 'banana', author: 'adams', pages: 30 },
    ];

    const sorted = sortBooksByAuthorGroup(mixedCase);
    expect(sorted.map((book) => book.title)).toEqual(['Apple', 'banana', 'zebra']);
  });
});

describe('applyBookSort', () => {
  const books: Book[] = [
    { id: '1', title: 'The Shining', author: 'King', pages: 447 },
    { id: '2', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
  ];

  it('returns insertion order for the default mode', () => {
    expect(applyBookSort(books, 'default').map((book) => book.id)).toEqual([
      '1',
      '2',
    ]);
  });

  it('returns title order for the title mode', () => {
    expect(applyBookSort(books, 'title').map((book) => book.title)).toEqual([
      'The Little Mermaid',
      'The Shining',
    ]);
  });

  it('returns author-group order for the authorGroup mode', () => {
    const groupedBooks: Book[] = [
      { id: '1', title: 'The Shining', author: 'King', pages: 447 },
      { id: '2', title: 'The Ugly Duckling', author: 'Andersen', pages: 32 },
      { id: '3', title: 'It', author: 'King', pages: 1138 },
      { id: '4', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
    ];

    expect(
      applyBookSort(groupedBooks, 'authorGroup').map(
        (book) => `${book.author} - ${book.title}`,
      ),
    ).toEqual([
      'Andersen - The Little Mermaid',
      'Andersen - The Ugly Duckling',
      'King - It',
      'King - The Shining',
    ]);
  });
});

describe('sort mode helpers', () => {
  it('returns labels and messages for each sort mode', () => {
    expect(getSortModeLabel('default')).toBe('Sort');
    expect(getSortModeLabel('title')).toBe('Sort By Title');
    expect(getSortModeLabel('authorGroup')).toBe(
      'Sort By Author Group',
    );
    expect(getSortModeMessage('title')).toBe('Books sorted by title.');
    expect(getSortModeMessage('authorGroup')).toBe(
      'Books sorted by author group.',
    );
    expect(getSortModeMessage('default')).toBe(
      'Showing books in default order.',
    );
  });

  it('cycles sort modes through default, author group, and title', () => {
    expect(SORT_MODE_CYCLE).toEqual(['default', 'authorGroup', 'title']);
    expect(getNextSortMode('default')).toBe('authorGroup');
    expect(getNextSortMode('authorGroup')).toBe('title');
    expect(getNextSortMode('title')).toBe('default');
  });
});
