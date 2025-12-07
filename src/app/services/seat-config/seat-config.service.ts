import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

type loaiGhe = 'EMPTY' | 'STANDARD' | 'VIP' | 'COUPLE' | 'BLOCK';

export interface GheDto {
  id?: number;           // id ghế (nếu đã lưu trong DB)
  nhanGhe: string;          // A1, A2...
  hang: number;      // 0-based
  cot: number;      // 0-based
  loaiGhe: loaiGhe;        // STANDARD / VIP / COUPLE / BLOCK / EMPTY
  nhomCouple?: string | null;
  coupleRole?: 'MAIN' | 'GHOST' | null;
}

export interface GheLayoutDto {
  hang: number;
  cot: number;
  gheDTO: GheDto[];
}

@Injectable({
  providedIn: 'root'
})
export class SeatConfigService {

  private baseUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  getLayout(roomId: number): Observable<GheLayoutDto> {
    return this.http.get<GheLayoutDto>(`${this.baseUrl}/admin/phong-config/${roomId}/ghe-config`);
  }

  saveLayout(roomId: number, layout: GheLayoutDto): Observable<GheLayoutDto> {
    return this.http.post<GheLayoutDto>(`${this.baseUrl}/admin/phong-config/${roomId}/ghe-config`, layout);
  }

  deleteLayout(maPhong: number): Observable<void> {
    // Gọi API DELETE tới endpoint Backend
    return this.http.delete<void>(`${this.baseUrl}/admin/phong-config/${maPhong}/ghe-config`);
}
}
