import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

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
    return this.fetchPlaces("/user-places","error in loading user places");
  }

  addPlaceToUserPlaces(place: Place) {
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id
    })
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
