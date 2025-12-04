import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
export interface LichChieuDto {
  id: number;
  maPhim: number;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
  // basePrice: number; 
}

export interface MovieOption {
  id: number;
  tenPhim: string;
}

export type CreateUpdateLichChieuDto = Omit<LichChieuDto, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {

  private apiUrl = environment.apiBase;
  // private apiUrl = '/api/admin/showtimes';
  // private movieApiUrl = '/api/admin/movies';

  constructor(private http: HttpClient) {}

  
  // getMovies(): Observable<MovieOption[]> {
    
  //   // --- Mock tạm thời cho đến khi API Phim sẵn sàng ---
  //   const mockMovies: MovieOption[] = [
  //     { id: 1, title: 'Mickey 17' },
  //     { id: 2, title: 'Joker: Folie à Deux – Điên Có Đôi' },
  //     { id: 3, title: 'Những Mảnh Ghép Cảm Xúc 2' },
  //     { id: 4, title: 'Garfield – Mèo Béo Siêu Quậy' },
  //     { id: 5, title: 'Kẻ Thứ Thần' },
  //   ];
  //   return new Observable(observer => {
  //       setTimeout(() => {
  //           observer.next(mockMovies);
  //           observer.complete();
  //       }, 100);
  //   });
  // }

  getMovies(): Observable<MovieOption[]> {
    return this.http.get<MovieOption[]>(`${this.apiUrl}/phim/available`);
  }

  // Lấy danh sách lịch chiếu
  getShowtimes(): Observable<LichChieuDto[]> {
    // GỌI API: GET /api/admin/showtimes
    return this.http.get<LichChieuDto[]>(`${this.apiUrl}/lich-chieu`);
  }
  // getShowtimes(): Observable<LichChieuDto[]> {
  //   const mockShowtimes: LichChieuDto[] = [
  //     { id: 1, maPhim: 1, startDate: '2025-02-28', endDate: '2025-03-23' },
  //     { id: 2, maPhim: 2, startDate: '2024-10-04', endDate: '2024-11-10' },
  //     { id: 3, maPhim: 3, startDate: '2024-06-14', endDate: '2024-07-28' },
  //     { id: 4, maPhim: 4, startDate: '2024-05-31', endDate: '2024-06-09' },
  //     { id: 5, maPhim: 5, startDate: '2024-05-03', endDate: '2024-06-02' },
  //   ];
  //   return new Observable(observer => {
  //       setTimeout(() => {
  //           observer.next(mockShowtimes);
  //           observer.complete();
  //       }, 300);
  //   });
  // }

  

  // Tạo lịch chiếu mới
  createShowtime(showtime: Omit<LichChieuDto, 'id'>): Observable<LichChieuDto> {
    // Gọi API: POST /api/admin/showtimes
    return this.http.post<LichChieuDto>(`${this.apiUrl}/lich-chieu`, showtime);
  }

  // Cập nhật lịch chiếu
  updateShowtime(id: number, showtime: Omit<LichChieuDto, 'id'>): Observable<LichChieuDto> {
    // Gọi API: PUT /api/admin/showtimes/{id}
    console.log('kiem tra');
    console.log(id);
    return this.http.put<LichChieuDto>(`${this.apiUrl}/lich-chieu/${id}`, showtime);
  }

  // Xóa lịch chiếu
  deleteShowtime(id: number): Observable<void> {
    // Gọi API: DELETE /api/admin/showtimes/{id}
    return this.http.delete<void>(`${this.apiUrl}/lich-chieu/${id}`);
  }
}
