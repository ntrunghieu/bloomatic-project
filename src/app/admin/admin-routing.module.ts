import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminModule } from './admin.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieCreateComponent } from './movie-create/movie-create.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { RoomListComponent } from './room-list/room-list.component';
import { CinemaListComponent } from './cinema-list/cinema-list.component';
import { CinemaCreateComponent } from './cinema-create/cinema-create.component';
import { ShowtimeListComponent } from './showtime-list/showtime-list.component';
import { ShowtimeSessionListComponent } from './showtime-session-list/showtime-session-list.component';
import { OrderListComponent } from './order-list/order-list.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,  // layout có sidebar + router-outlet
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // /admin => /admin/dashboard
      { path: 'dashboard', component: DashboardComponent },
      { path: 'movies/list', component: MovieListComponent },
      { path: 'movies/create', component: MovieCreateComponent },
      {
        path: 'movies/:id',   // <-- dùng chung MovieCreateComponent cho edit
        loadComponent: () =>
          import('./movie-create/movie-create.component').then(
            (m) => m.MovieCreateComponent
          ),
      },
      { path: 'rooms/list', component: RoomListComponent },
      {
        path: 'rooms/:id/seat-config',
        loadComponent: () =>
          import('./room-seat-config/room-seat-config.component').then(
            (m) => m.RoomSeatConfigComponent
          ),
      },
      { path: 'cinemas/list', component: CinemaListComponent },
      { path: 'cinemas/create', component: CinemaCreateComponent },
      {
        path: 'cinemas/:id',
        loadComponent: () =>
          import('./cinema-detail/cinema-detail.component').then(
            (m) => m.CinemaDetailComponent
          ),
      },
      { path: 'showtimes/list', component: ShowtimeListComponent },
      { path: 'showtimes/sessions', component: ShowtimeSessionListComponent },
      { path: 'orders', component: OrderListComponent },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ADMIN_ROUTES)],
  exports: [RouterModule]
})
export class AdminRoutingModule {

}


