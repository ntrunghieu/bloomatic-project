import { Injectable } from '@angular/core';
import { RapLichChieuDto } from '../../schedule/schedule.component';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

export interface SeatLayoutDto {
  hang: number;
  cot: number;
  gheUserDto: gheUserDto[];
}

export interface gheUserDto {
  id: number;
  nhanGhe: string;
  hang: number;   // index 0-based
  cot: number;    // index 0-based hoặc 1-based tuỳ BE
  loaiGhe: string;
  nhomCouple?: string | null;
  coupleRole?: string | null;
  trangThai: string; // "BOOKED" / "AVAILABLE"
  heSoGia?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = environment.apiBase;

  constructor(private http: HttpClient) { }

  getSchedules(city: string, startDate: string): Observable<RapLichChieuDto[]> {
    let params = new HttpParams()
      .set('city', city)
      .set('startDate', startDate);

    return this.http.get<RapLichChieuDto[]>(`${this.apiUrl}/lich-chieu/dat-ve`, { params });
  }

  getSeatLayout(lichChieuId: number) {
    return this.http.get<SeatLayoutDto>(
      `http://localhost:8080/api/public/suat-chieu/${lichChieuId}/ghe`
    );
  }

  holdSeats(lichChieuId: number, seatIds: number[]) {
    // SỬA ĐỔI: Nối this.apiUrl với đường dẫn API
    return this.http.post(this.apiUrl + '/user/suat-chieu/' + lichChieuId + '/hold', {
      seatIds: seatIds
    });
  }

  releaseSeats(lichChieuId: number, seatIds: number[]) {
    // SỬA ĐỔI: Nối this.apiUrl với đường dẫn API
    return this.http.post(this.apiUrl + '/user/suat-chieu/' + lichChieuId + '/release', {
      seatIds: seatIds
    });
  }

}
