import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { BehaviorSubject, tap } from 'rxjs';

export interface LoginReq { email: string; password: string; }
export interface LoginRes {
  accessToken: string;
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private base = '/api/auth';
  private currentUserSubject = new BehaviorSubject<LoginRes | null>(this.load());
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(private http: HttpClient) {}

  login(payload: LoginReq) {
    return this.http.post<LoginRes>(`${environment.apiBase}/auth/login`, payload).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('auth', JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth');
     this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem('accessToken');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
  private load(): LoginRes | null {
    try { return JSON.parse(localStorage.getItem('auth') || 'null'); }
    catch { return null; }
  }
}
