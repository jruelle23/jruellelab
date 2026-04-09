import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './service/api';
import { ModalComponent } from './modal/modal';
import {catchError, EMPTY, Subject, switchMap} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('jruellelab');
  private apiService = inject(Api);

  // Signals replace plain properties — Angular tracks these automatically
  isModalOpen = signal(false);
  apiMessage  = signal('');
  isLoading   = signal(false);

  // A Subject acts as a trigger stream for our button clicks
  private fetchTrigger$ = new Subject<void>();

  constructor() {
    this.fetchTrigger$
      .pipe(
        // switchMap cancels the previous HTTP request if a new click
        // comes in before the previous one completed — kills the race condition
        switchMap(() => {
          this.isLoading.set(true);
          return this.apiService.getHelloWorld().pipe(
            // catchError is on the INNER observable (the HTTP call)
            // errors are handled here and never bubble up to subscribe()
            catchError((err) => {
              this.apiMessage.set('Error: ' + err.message);
              this.isModalOpen.set(true);
              this.isLoading.set(false);
              return EMPTY;
            })
          );
        })
      )
      .subscribe({
        next: (response) => {
          this.apiMessage.set(response);
          this.isModalOpen.set(true);
          this.isLoading.set(false);
        }
      });
  }

  fetchHello() {
    this.fetchTrigger$.next(); // push an event into the stream
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
