import { Component } from '@angular/core';
import { BookLibraryComponent } from './components/book-library/book-library.component';

@Component({
  selector: 'app-root',
  imports: [BookLibraryComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
