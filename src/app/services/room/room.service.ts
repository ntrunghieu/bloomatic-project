import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
export interface PhongDto {
  maPhong: number;
  maRap: number;
  tenPhong: string;
  loaiPhong: string; // STANDARD/IMAX...
  trangThai: boolean;
  hang: number;
  cot: number;
  tongSoGhe: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaoPhongRequest {
  tenPhong: string;
  loaiPhong: string;
  hang: number;
  cot: number;
}

export interface GheDto {
  maGhe: number;
  hang: number;
  cot: number;
  nhanGhe: string;
  loaiGhe: string;
  nhomCouple?: string | null;
  hoatDong: boolean;
  hesoGia: number;
}

export interface GheUpdateReq {
  maGhe: number;
  loaiGhe: string;
  hoatDong: boolean;
  nhomCouple?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private api = environment.apiBase;

  constructor(private http: HttpClient) { }

  danhSachPhong(maRap: number) {
    return this.http.get<PhongDto[]>(`${this.api}/rap/${maRap}/phong`);
  }

  taoPhong(maRap: number, payload: TaoPhongRequest) {
    return this.http.post<PhongDto>(`${this.api}/rap/${maRap}/phong`, payload);
  }

  capNhatPhong(maPhong: number, payload: TaoPhongRequest) {
    return this.http.put<PhongDto>(`${this.api}/phong/${maPhong}`, payload);
  }

  xoaPhong(maPhong: number) {
    return this.http.delete<void>(`${this.api}/phong/${maPhong}`);
  }

  layGhePhong(maPhong: number) {
    return this.http.get<GheDto[]>(`${this.api}/phong/${maPhong}/ghe`);
  }

  luuCauHinhGhe(maPhong: number, ds: GheUpdateReq[]) {
    return this.http.put<void>(`${this.api}/phong/${maPhong}/ghe`, ds);
  }
}
