import { computed, Injectable, signal } from '@angular/core';
import { Book, BookInput, BookSortMode } from '../models/book.model';
import { searchBooksByTitle } from '../utils/book-search.util';
import {
  applyBookSort,
  getNextSortMode,
  getSortModeLabel,
} from '../utils/book-sort.util';
import { createBookFromXml } from '../utils/xml-book.util';

@Injectable({ providedIn: 'root' })
export class BookLibraryService {
  readonly booksSignal = signal<Book[]>([]);
  readonly titleValueSignal = signal('');
  readonly sortModeSignal = signal<BookSortMode>('default');

  readonly sortButtonLabel = computed(() =>
    getSortModeLabel(getNextSortMode(this.sortModeSignal())),
  );

  readonly displayedBooks = computed(() => {
    const filtered = searchBooksByTitle(
      this.booksSignal(),
      this.titleValueSignal(),
    );
    return applyBookSort(filtered, this.sortModeSignal());
  });

  setTitleValue(value: string): void {
    this.titleValueSignal.set(value);
  }

  applyCurrentSortAction(): BookSortMode {
    const nextMode = getNextSortMode(this.sortModeSignal());
    this.sortModeSignal.set(nextMode);
    return nextMode;
  }

  loadBooks(books: Book[]): void {
    this.booksSignal.set([...books]);
    this.sortModeSignal.set('default');
  }

  addBook(input: BookInput): Book {
    const book = createBookFromXml(input);
    this.booksSignal.update((books) => [...books, book]);
    return book;
  }

  updateBook(id: string, input: BookInput): void {
    this.booksSignal.update((books) =>
      books.map((book) =>
        book.id === id ? { ...book, ...input } : book,
      ),
    );
  }

  removeBook(id: string): void {
    this.booksSignal.update((books) =>
      books.filter((book) => book.id !== id),
    );
  }

  getBookById(id: string): Book | undefined {
    return this.booksSignal().find((book) => book.id === id);
  }
}
