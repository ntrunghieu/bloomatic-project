
// import { inject } from '@angular/core';
// import { CanActivateFn, Router, UrlTree } from '@angular/router';
// import { AuthService } from '../auth/auth.service';
// import { map } from 'rxjs';
// export const authGuard: CanActivateFn = (route, state) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   // Nếu bạn có observable currentUser$ như đã làm
//   return auth.currentUser$.pipe(
//     map(user => {
//       if (user) return true;

//       // Lưu returnUrl để đăng nhập xong quay lại
//       router.navigate(['/'], { queryParams: { returnUrl: state.url } });
//       return false as UrlTree | boolean;
//     })
//   );
// };

// import { Injectable } from '@angular/core';
// import {
//   ActivatedRouteSnapshot,
//   CanActivate,
//   CanActivateChild,
//   Router,
//   RouterStateSnapshot,
//   UrlTree,
// } from '@angular/router';
// import { AuthService } from '../auth/auth.service'; // sửa lại path cho đúng

// @Injectable({
//   providedIn: 'root',
// })
// export class AdminAuthGuard implements CanActivate, CanActivateChild {
//   constructor(
//     private auth: AuthService,
//     private router: Router
//   ) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): boolean | UrlTree {
//     // Chưa đăng nhập => đẩy về trang login admin
//     if (!this.auth.isLoggedIn) {
//       return this.router.createUrlTree(['/admin/login'], {
//         queryParams: { returnUrl: state.url },
//       });
//     }

//     // Nếu muốn chặn luôn user thường, chỉ cho ADMIN vào:
//     if (!this.auth.isAdmin) {
//       // Không phải admin thì cho về trang ngoài (tuỳ bạn)
//       return this.router.createUrlTree(['/']);
//     }

//     return true;
//   }

//   canActivateChild(
//     childRoute: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): boolean | UrlTree {
//     return this.canActivate(childRoute, state);
//   }
// }
import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanActivateChildFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Chưa đăng nhập -> về trang login admin
  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/admin/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Đã login nhưng không có quyền admin -> đá ra ngoài trang user
  if (!auth.isAdmin) {
    return router.createUrlTree(['/']);
  }

  // OK
  return true;
};

// Cho children dùng chung luôn
export const authChildGuard: CanActivateChildFn = (route, state) => 
  authGuard(route, state);


