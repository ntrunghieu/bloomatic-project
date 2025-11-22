import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { SeatsComponent } from './seats/seats.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ADMIN_ROUTES } from './admin/admin-routing.module';
import { BookingSuccessComponent } from './booking-success/booking-success.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'movie-detail',
        component: MovieDetailComponent,
    },
    { path: 'seat', component: SeatsComponent },
    { path: 'schedule', component: ScheduleComponent },
    // { path: 'admin', component: AdminDashboardComponent },
    {
        path: 'admin',
        loadChildren: () =>
            import('./admin/admin-routing.module').then(m => m.ADMIN_ROUTES),
    },
    {
        path: 'booking/success',
        component: BookingSuccessComponent,
    },

];
