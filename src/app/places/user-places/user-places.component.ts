import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {

  places = signal<Place[] | undefined> (undefined);
  errors = signal('');
  isFetching = signal(false);

  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);


  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.httpClient.get<{places: Place[]}>("http://localhost:3000/user-places")
    .pipe(
      map((resData)=> resData.places),
      catchError((error) => {
        console.log(error);
        return throwError(()=> new Error('Something went wrong fetching the favourite places'));
      })
    ) 
    .subscribe({
      next: (places) => this.places.set(places),
      error: (error)=> this.errors.set(error.message),
      complete: ()=> this.isFetching.set(false)
    });


    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })



      
  }

}
