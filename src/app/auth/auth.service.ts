import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { BehaviorSubject, tap } from 'rxjs';

export interface LoginReq {
  email: string;
  password: string;
}

export interface LoginRes {
  accessToken: string;
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // BehaviorSubject để broadcast user hiện tại
  private currentUserSubject = new BehaviorSubject<LoginRes | null>(this.loadFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Gọi API đăng nhập */
  login(payload: LoginReq) {
    return this.http
      .post<LoginRes>(`${environment.apiBase}/auth/login`, payload)
      .pipe(
        tap((res) => {
          // lưu token + thông tin user
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('auth', JSON.stringify(res));
          this.currentUserSubject.next(res);
        })
      );
  }

  /** Đăng xuất: xóa localStorage + BehaviorSubject */
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth');
    this.currentUserSubject.next(null);
  }

  /** Token JWT hiện tại */
  get token(): string | null {
    return localStorage.getItem('accessToken');
  }

  /** Có đang đăng nhập hay không */
  get isLoggedIn(): boolean {
    return !!this.token;
  }

  /** Object user hiện tại (LoginRes) */
  get currentUser(): LoginRes | null {
    return this.currentUserSubject.value;
  }

  /** Tên đầy đủ để hiển thị trên avatar / menu */
  get fullName(): string {
    return this.currentUserSubject.value?.fullName ?? '';
  }

  /** Email hiện tại */
  get email(): string {
    return this.currentUserSubject.value?.email ?? '';
  }

  /** Danh sách role hiện tại */
  get roles(): string[] {
    return this.currentUserSubject.value?.roles ?? [];
  }

  /** Kiểm tra có role cụ thể không */
  hasRole(role: string): boolean {
    const normalized = role.toUpperCase();
    return this.roles.map((r) => r.toUpperCase()).includes(normalized);
  }

  /** Có phải admin không (ROLE_ADMIN / ADMIN) */
  get isAdmin(): boolean {
    const upperRoles = this.roles.map((r) => r.toUpperCase());
    return upperRoles.includes('ADMIN') || upperRoles.includes('ROLE_ADMIN');
  }

  /** Đọc thông tin auth từ localStorage để khởi tạo BehaviorSubject */
  private loadFromStorage(): LoginRes | null {
    try {
      const raw = localStorage.getItem('auth');
      if (!raw) return null;
      return JSON.parse(raw) as LoginRes;
    } catch {
      return null;
    }
  }
}
