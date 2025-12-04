
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


