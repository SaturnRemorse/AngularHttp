import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

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
        this.errorService.showError("Failed to store selected place.")
        return throwError(() => new Error("Failed to store selected place."))
      })
    )
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    this.userPlaces.set(prevPlaces.filter((p) => p.id!==place.id ));
    return this.httpClient.delete("http://localhost:3000/user-places/"+place.id).pipe(
      catchError(error => {
        console.log(error);
        this.userPlaces.set(prevPlaces);
        this.errorService.showError("error occured while deletion");
        return throwError(() => new Error("error occured while deletion"));
      })
    )
  }

  private fetchPlaces(endpoint: string, errorMsg: string){
    return this.httpClient.get<{places: Place[]}>("http://localhost:3000"+endpoint)
    .pipe(
      map((resData)=> resData.places),
      catchError((error) => {
        console.log(error);
        this.errorService.showError(errorMsg);
        return throwError(()=> new Error(errorMsg));
      })
    ) 
  }
}
