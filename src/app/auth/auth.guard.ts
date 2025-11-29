
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs';
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Nếu bạn có observable currentUser$ như đã làm
  return auth.currentUser$.pipe(
    map(user => {
      if (user) return true;

      // Lưu returnUrl để đăng nhập xong quay lại
      router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      return false as UrlTree | boolean;
    })
  );
};
