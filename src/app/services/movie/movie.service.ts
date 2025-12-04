import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

/** Page kiểu Spring Data */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;  // page hiện tại (0-based)
  size: number;
}

/** Dữ liệu phim trả về từ BE (PhimDto / entity Phim) */
export interface PhimDto {
  id: number;
  tenPhim: string;
  daoDien?: string;
  dienVien?: string;
  thoiLuong: number;
  quocGia?: string;
  ngayKhoiChieu?: string;  // yyyy-MM-dd
  ngayKetThuc?: string;    // yyyy-MM-dd
  ngayTao?: string;
  posterUrl?: string;
  trailerUrl?: string;
  moTa?: string;
  trangThai: string;       // 'Sắp chiếu' / 'Đang chiếu' / 'Đã chiếu'
  gioiHanTuoi?: string;    // P / C13 / C16 / C18
  dsMaTheLoai?: string[];      // nếu BE map ra list tên thể loại
  createdAt?: string;      // ISO datetime
}

/** Payload gửi lên khi tạo / cập nhật phim (PhimRequest) */
export interface PhimRequestPayload {
  tenPhim: string;
  daoDien?: string;
  dienVien?: string;
  thoiLuong: number;
  quocGia?: string;
  ngayKhoiChieu?: string | null;
  ngayKetThuc?: string | null;
  posterUrl?: string | null;
  trailerUrl?: string;
  moTa?: string;
  trangThai: string;
  gioiHanTuoi?: string | null;
  dsMaTheLoai?: string[];
  // createdAt: string;
}

/** Model cho trang Home (đang chiếu / sắp chiếu) */
export interface HomeMovie {
  id: number;
  title: string;
  poster: string;
  age: string;
  dayNo: number;
  genres: string[];
  release: string;      // yyyy-MM-dd
  description: string;
  trailerId: string;
}

/** Model cho bảng danh sách trong admin */
export interface AdminMovieRow {
  id: number;
  name: string;
  // releaseYear?: number;
  genres: string[];
  showDate: string;     // hiển thị dd/MM/yyyy
  status: string;
  createdDate: string;
}

export interface TheLoaiDto {
  maTheLoai: number;
  tenTheLoai: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  /** Ví dụ: http://localhost:8080/api/phim */
  private baseUrl = `${environment.apiBase}/phim`;

  constructor(private http: HttpClient) { }

  getGenres() {
    return this.http.get<TheLoaiDto[]>(`${environment.apiBase}/the-loai`);
  }

  // ================== PUBLIC (Home) ==================

  /** Phim đang chiếu cho trang Home */
  getNowShowing(): Observable<HomeMovie[]> {
    const params = new HttpParams()
      .set('trangThai', 'Đang chiếu')
      .set('page', 0)
      .set('size', 10);

    return this.http
      .get<PageResponse<PhimDto>>(this.baseUrl, { params })
      .pipe(map(res => (res.content ?? []).map(dto => this.toHomeMovie(dto))));
  }

  /** Phim sắp chiếu cho trang Home */
  getComingSoon(): Observable<HomeMovie[]> {
    const params = new HttpParams()
      .set('trangThai', 'Sắp chiếu')
      .set('page', 0)
      .set('size', 10);

    return this.http
      .get<PageResponse<PhimDto>>(this.baseUrl, { params })
      .pipe(map(res => (res.content ?? []).map(dto => this.toHomeMovie(dto))));
  }

  // ================== ADMIN CRUD ==================

  /** Danh sách phim cho admin (có phân trang) */
  getMoviesAdmin(page: number, size: number): Observable<PageResponse<AdminMovieRow>> {
    const params = new HttpParams()
      .set('page', page)   // page index (0-based)
      .set('size', size);

    return this.http
      .get<PageResponse<PhimDto>>(this.baseUrl, { params })
      .pipe(
        map(res => ({
          ...res,
          content: (res.content ?? []).map(dto => this.toAdminRow(dto))
        }))
      );
  }

  /** Lấy chi tiết 1 phim theo id */
  getMovieById(id: number): Observable<PhimDto> {
    return this.http.get<PhimDto>(`${this.baseUrl}/${id}`);
  }

  /** Tạo phim mới (ADMIN) */
  createMovie(payload: PhimRequestPayload): Observable<PhimDto> {
    return this.http.post<PhimDto>(`${this.baseUrl}/admin`, payload);
  }

  /** Cập nhật phim (ADMIN) */
  updateMovie(id: number, payload: PhimRequestPayload): Observable<PhimDto> {
    return this.http.put<PhimDto>(`${this.baseUrl}/admin/${id}`, payload);
  }

  /** Xóa phim (ADMIN) */
  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/${id}`);
  }

  // ================== MAPPING HELPER ==================

  /** Map PhimDto -> HomeMovie (dùng cho trang Home) */
  private toHomeMovie(dto: PhimDto): HomeMovie {
    const releaseDate = dto.ngayKhoiChieu ? new Date(dto.ngayKhoiChieu) : null;

    return {
      id: dto.id,
      title: dto.tenPhim,
      poster: dto.posterUrl ?? '',
      age: dto.gioiHanTuoi ?? '',
      dayNo: releaseDate ? releaseDate.getDate() : 0,
      genres: dto.dsMaTheLoai ?? [],
      release: dto.ngayKhoiChieu ?? '',
      description: dto.moTa ?? '',
      trailerId: dto.trailerUrl ?? ''
    };
  }

  /** Map PhimDto -> AdminMovieRow (dùng cho bảng admin) */
  private toAdminRow(dto: PhimDto): AdminMovieRow {
    const ngayKhoi = dto.ngayKhoiChieu ? new Date(dto.ngayKhoiChieu) : null;
    const created = dto.createdAt ? new Date(dto.createdAt) : null;

    return {
      id: dto.id,
      name: dto.tenPhim,
      // releaseYear: ngayKhoi ? ngayKhoi.getFullYear() : undefined,
      genres: dto.dsMaTheLoai ?? [],
      showDate: ngayKhoi
        ? ngayKhoi.toLocaleDateString('vi-VN')
        : '',
      status: dto.trangThai,
      // createdAtRaw: dto.createdAt
      createdDate: created
        ? created.toLocaleDateString('vi-VN')
        : ''
    };
  }
}
