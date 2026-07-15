import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { BookLibraryService } from './book-library.service';

describe('BookLibraryService', () => {
  let service: BookLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookLibraryService);
  });

  it('adds, updates, and removes books', () => {
    const created = service.addBook({
      title: 'The Shining',
      author: 'King',
      pages: 447,
    });

    expect(service.booksSignal()).toHaveLength(1);
    expect(service.getBookById(created.id)).toEqual(created);

    service.updateBook(created.id, {
      title: 'It',
      author: 'King',
      pages: 1138,
    });

    expect(service.getBookById(created.id)?.title).toBe('It');

    service.removeBook(created.id);
    expect(service.booksSignal()).toEqual([]);
  });

  it('loads books and replaces the current library', () => {
    service.addBook({ title: 'Old', author: 'Author', pages: 10 });
    service.loadBooks([
      { id: '1', title: 'New', author: 'Author', pages: 20 },
    ]);

    expect(service.booksSignal()).toHaveLength(1);
    expect(service.booksSignal()[0].title).toBe('New');
  });

  it('applies sort actions that match the button label', () => {
    service.loadBooks([
      { id: '1', title: 'The Shining', author: 'King', pages: 447 },
      { id: '2', title: 'The Ugly Duckling', author: 'Andersen', pages: 32 },
      { id: '3', title: 'It', author: 'King', pages: 1138 },
      { id: '4', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
    ]);

    expect(service.sortButtonLabel()).toBe('Sort By Author Group');

    service.applyCurrentSortAction();
    expect(service.sortModeSignal()).toBe('authorGroup');
    expect(
      service.displayedBooks().map((book) => `${book.author} - ${book.title}`),
    ).toEqual([
      'Andersen - The Little Mermaid',
      'Andersen - The Ugly Duckling',
      'King - It',
      'King - The Shining',
    ]);
    expect(service.sortButtonLabel()).toBe('Sort By Title');

    service.applyCurrentSortAction();
    expect(service.sortModeSignal()).toBe('title');
    expect(service.displayedBooks().map((book) => book.title)).toEqual([
      'It',
      'The Little Mermaid',
      'The Shining',
      'The Ugly Duckling',
    ]);
    expect(service.sortButtonLabel()).toBe('Sort');

    service.applyCurrentSortAction();
    expect(service.sortModeSignal()).toBe('default');
    expect(service.displayedBooks().map((book) => book.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
    ]);
    expect(service.sortButtonLabel()).toBe('Sort By Author Group');
  });

  it('resets sort mode when loading books', () => {
    service.loadBooks([
      { id: '1', title: 'The Shining', author: 'King', pages: 447 },
    ]);
    service.applyCurrentSortAction();
    service.applyCurrentSortAction();

    service.loadBooks([
      { id: '2', title: 'It', author: 'King', pages: 1138 },
    ]);

    expect(service.sortModeSignal()).toBe('default');
    expect(service.sortButtonLabel()).toBe('Sort By Author Group');
  });

  it('filters displayed books by title value', () => {
    service.loadBooks([
      { id: '1', title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
      { id: '2', title: 'The Shining', author: 'King', pages: 447 },
    ]);

    service.setTitleValue('shin');
    expect(service.displayedBooks().map((book) => book.title)).toEqual([
      'The Shining',
    ]);

    service.setTitleValue('');
    expect(service.displayedBooks()).toHaveLength(2);
  });
});
