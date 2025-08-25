import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces("/places", "error in loading available places");
  }

  loadUserPlaces() {
    return this.fetchPlaces("/user-places","error in loading user places").pipe(tap({
      next: (userPlaces) => this.userPlaces.set(userPlaces),
    }));
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if(!prevPlaces.some((p) => p.id === place.id)){
      this.userPlaces.set([...prevPlaces, place]);
    } 
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id
    }).pipe(
      catchError(error => {
        this.userPlaces.set(prevPlaces);
        return throwError(() => new Error("Failed to store selected place."))
      })
    )
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(endpoint: string, errorMsg: string){
    return this.httpClient.get<{places: Place[]}>("http://localhost:3000"+endpoint)
    .pipe(
      map((resData)=> resData.places),
      catchError((error) => {
        console.log(error);
        return throwError(()=> new Error(errorMsg));
      })
    ) 
  }
}
