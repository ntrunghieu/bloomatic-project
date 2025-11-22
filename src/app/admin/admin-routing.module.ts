import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminModule } from './admin.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieCreateComponent } from './movie-create/movie-create.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,  // layout có sidebar + router-outlet
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // /admin => /admin/dashboard
      { path: 'dashboard', component: DashboardComponent },
      { path: 'movies/list', component: MovieListComponent },
      { path: 'movies/create', component: MovieCreateComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ADMIN_ROUTES)],
  exports: [RouterModule]
})
export class AdminRoutingModule { 

}


