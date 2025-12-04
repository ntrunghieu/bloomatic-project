import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface Rap {
  id: number;
  tenRap: string;
  diaChi: string;
  createdAt: string;
}

interface Phong {
  id: number;
  maRap: number;
  tenPhong: string;
}

interface Phim {
  id: number;
  tenPhim: string;
  trangThai: 'Đang chiếu' | 'Sắp chiếu' | 'Đã chiếu';
  thoiLuong: number;
}

type SlotType = 'Theo lịch' | 'Suất đặc biệt';
type trangThai = 'Đang chiếu' | 'Sắp chiếu' | 'Đã chiếu';

interface SuatChieu {
  id: number;
  maRap: number;
  maPhong: number;
  maPhim: number;
  ngayBatDau: string; 
  ngayKetThuc: string;
  dinhDang: string;     // 2D, 3D, IMAX...
  hinhThucDich: string;   // Phụ đề, Thuyết minh...
  gioBatDau: string;  // HH:mm
  gioKetThuc: string;    // HH:mm
  trangThai: string;
  giaCoSo: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShowtimeSessionService {

  private apiUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  // Lấy dữ liệu đã lọc
  getFilteredSlots(
    maRap: number,
    maPhong: number,
    ngayBatDau: string
    // ngayKetThuc: string
  ): Observable<SuatChieu[]> {
    let params = new HttpParams()
      .set('maRap', maRap.toString())
      .set('maPhong', maPhong.toString())
      .set('ngayBatDau', ngayBatDau)
      // .set('ngayKetThuc', ngayKetThuc); 

    return this.http.get<SuatChieu[]>(`${this.apiUrl}/suat-chieu`, { params });
  }

  // Tạo suất chiếu
  createSlot(slot: Omit<SuatChieu, 'id'>): Observable<SuatChieu> {
    // Chú ý: BE cần map basePrice từ number (FE) sang BigDecimal (BE)
    return this.http.post<SuatChieu>(`${this.apiUrl}/suat-chieu`, slot);
  }

  // Cập nhật suất chiếu
  updateSlot(id: number, slot: Omit<SuatChieu, 'id'>): Observable<SuatChieu> {
    return this.http.put<SuatChieu>(`${this.apiUrl}/suat-chieu/${id}`, slot);
  }

  // Xóa suất chiếu
  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/suat-chieu/${id}`);
  }

  // Lấy danh sách Rạp (Cinemas)
  getCinemas(): Observable<Rap[]> {
    return this.http.get<Rap[]>(`${this.apiUrl}/filter/rap`);
  }

  // Lấy danh sách Phòng (Rooms)
  getRooms(): Observable<Phong[]> {
    return this.http.get<Phong[]>(`${this.apiUrl}/filter/phong`);
  }

  // Lấy danh sách Phim (Movies)
  getMovies(): Observable<Phim[]> {
    return this.http.get<Phim[]>(`${this.apiUrl}/filter/phim`);
  }

  // Hàm tải tất cả dữ liệu ban đầu
  loadAllInitialData(): Observable<[Rap[], Phong[], Phim[]]> {
    return forkJoin([
      this.getCinemas(),
      this.getRooms(),
      this.getMovies()
    ]);
  }
}
