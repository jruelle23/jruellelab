import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // makes this service available everywhere in the app
})
export class Api {

  // inject() is the modern Angular way to get dependencies (replaces constructor injection)
  private http = inject(HttpClient);
  private apiUrl = '/api/hello';

  // If your API returns JSON like { "message": "hello" }, remove that option
  // and change the return type to Observable<{ message: string }>
  getHelloWorld(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
