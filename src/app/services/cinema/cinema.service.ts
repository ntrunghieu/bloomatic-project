import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RapDto {
  id: number;
  tenRap: string;
  diaChi: string;
  dienThoai?: string | null;
  email?: string | null;
  // trangThai: number;       
  createdAt: string;       // ISO datetime
  // updatedAt: string;       
}

export interface TaoRapRequest {
  tenRap: string;
  diaChi: string;
  // dienThoai?: string | null;
  // email?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CinemaService {

  private baseUrl = `${environment.apiBase}/rap`;

  constructor(private http: HttpClient) {}

  /** Lấy danh sách tất cả rạp */
  danhSachRap(): Observable<RapDto[]> {
    return this.http.get<RapDto[]>(this.baseUrl);
  }

  /** Tạo rạp mới */
  taoRap(payload: TaoRapRequest): Observable<RapDto> {
    return this.http.post<RapDto>(this.baseUrl, payload);
  }

  /** (bonus) Lấy chi tiết 1 rạp, để sau này sửa/xem detail */
  chiTietRap(maRap: number): Observable<RapDto> {
    return this.http.get<RapDto>(`${this.baseUrl}/${maRap}`);
  }

  capNhatRap(maRap: number, payload: TaoRapRequest): Observable<RapDto> {
    return this.http.put<RapDto>(`${this.baseUrl}/${maRap}`, payload);
  }

  xoaRap(maRap: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${maRap}`);
  }
}
