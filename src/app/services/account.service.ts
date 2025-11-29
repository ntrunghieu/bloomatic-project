import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Profile {
  id: number;
  fullName: string;
  phone?: string;
  email: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
}

export interface UpdateProfileReq {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}

export interface OrderRow {
  id: number;
  orderCode: string;
  movieTitle: string;
  totalAmount: number;
  paidAt: string; // ISO
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private base = '/api/account';
  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.base}/me`);
  }

  updateProfile(body: UpdateProfileReq) {
    return this.http.put(`${this.base}/me`, body);
  }

  changePassword(body: ChangePasswordReq) {
    return this.http.post(`${this.base}/change-password`, body);
  }

  getOrders(page = 0, size = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<OrderRow>>(`/api/orders/my`, { params });
  }
}
