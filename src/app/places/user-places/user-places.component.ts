import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  errors = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);
  places=this.placesService.loadedUserPlaces;


  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces()
    .subscribe({
      error: (error)=> this.errors.set(error.message),
      complete: ()=> this.isFetching.set(false)
    });


    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })



      
  }

}
