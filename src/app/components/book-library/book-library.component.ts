import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Book, BookInput } from '../../models/book.model';
import { BookLibraryService } from '../../services/book-library.service';
import { getSortModeMessage } from '../../utils/book-sort.util';
import {
  downloadXmlFile,
  parseBooksFromXml,
  serializeBooksToXml,
} from '../../utils/xml-book.util';

type FormMode = 'add' | 'edit';

@Component({
  selector: 'app-book-library',
  imports: [FormsModule],
  templateUrl: './book-library.component.html',
  styleUrl: './book-library.component.scss',
})
export class BookLibraryComponent {
  private readonly library = inject(BookLibraryService);

  protected readonly displayedBooks = this.library.displayedBooks;
  protected readonly titleValue = this.library.titleValueSignal.asReadonly();
  protected readonly sortButtonLabel = this.library.sortButtonLabel;
  protected readonly formMode = signal<FormMode>('add');
  protected readonly editingBookId = signal<string | null>(null);
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly isStatusError = signal(false);

  protected readonly form = signal<BookInput>({ title: '', author: '', pages: 0 });

  protected readonly formHeading = computed(() =>
    this.formMode() === 'add' ? 'Add book' : 'Edit book',
  );

  protected readonly submitLabel = computed(() =>
    this.formMode() === 'add' ? 'Add book' : 'Save changes',
  );

  protected onTitleChange(value: string): void {
    this.library.setTitleValue(value);
  }

  protected onLoadXml(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const books = parseBooksFromXml(String(reader.result ?? ''));
        this.library.loadBooks(books);
        this.resetForm();
        this.showStatus(`Loaded ${books.length} book(s) from ${file.name}.`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to load the XML file.';
        this.showStatus(message, true);
      } finally {
        input.value = '';
      }
    };
    reader.onerror = () => {
      this.showStatus('Failed to read the selected file.', true);
      input.value = '';
    };
    reader.readAsText(file);
  }

  protected onSaveXml(): void {
    const books = this.library.booksSignal.asReadonly();
    if (books().length === 0) {
      this.showStatus('There are no books to export.', true);
      return;
    }

    const xml = serializeBooksToXml(books());
    downloadXmlFile(xml, 'library.xml');
    this.showStatus('Library exported as library.xml.');
  }

  protected onSort(): void {
    const mode = this.library.applyCurrentSortAction();
    this.showStatus(getSortModeMessage(mode));
  }

  protected onSubmitForm(): void {
    const input = this.validateFormInput();
    if (!input) {
      return;
    }

    if (this.formMode() === 'add') {
      this.library.addBook(input);
      this.showStatus(`Added "${input.title}".`);
    } else {
      const id = this.editingBookId();
      if (!id) {
        return;
      }
      this.library.updateBook(id, input);
      this.showStatus(`Updated "${input.title}".`);
    }

    this.resetForm();
  }

  protected onEditBook(book: Book): void {
    this.formMode.set('edit');
    this.editingBookId.set(book.id);
    this.form.set({ title: book.title, author: book.author, pages: book.pages });
  }

  protected onRemoveBook(book: Book): void {
    this.library.removeBook(book.id);
    if (this.editingBookId() === book.id) {
      this.resetForm();
    }
    this.showStatus(`Removed "${book.title}".`);
  }

  protected onCancelEdit(): void {
    this.resetForm();
  }

  private validateFormInput(): BookInput | null {
    const title = this.form().title.trim();
    const author = this.form().author.trim();
    const pages = this.form().pages;

    if (!title || !author) {
      this.showStatus('Title and author are required.', true);
      return null;
    }

    if (pages === null || !Number.isInteger(pages) || pages <= 0) {
      this.showStatus('Pages must be a positive whole number.', true);
      return null;
    }

    return { title, author, pages };
  }

  private resetForm(): void {
    this.formMode.set('add');
    this.editingBookId.set(null);
    this.form.set({ title: '', author: '', pages: 0 });
  }

  private showStatus(message: string, isError = false): void {
    this.statusMessage.set(message);
    this.isStatusError.set(isError);
  }
}
