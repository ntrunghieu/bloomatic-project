import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountLayoutComponent } from './account-layout/account-layout.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { AccountPasswordComponent } from './account-password/account-password.component';
import { AccountOrdersComponent } from './account-orders/account-orders.component';
import { routes } from '../app.routes';

export const accountRoutes: Routes = [
  {
    path: '',
    component: AccountLayoutComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: AccountProfileComponent },
      { path: 'change-password', component: AccountPasswordComponent },
      { path: 'orders', component: AccountOrdersComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
