// src/app/admin/showtime-session-list/showtime-session-list.component.ts
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ShowtimeService } from '../../services/showtime/showtime.service';
import { ShowtimeSessionService } from '../../services/showtime/showtime-session.service';
import { HttpErrorResponse } from '@angular/common/http';

interface Rap {
  id: number;
  tenRap: string;
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
type TrangThai = 'Đang chiếu' | 'Sắp chiếu' | 'Đã chiếu';

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

@Component({
  selector: 'app-showtime-session-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, CurrencyPipe],
  templateUrl: './showtime-session-list.component.html',
  styleUrl: './showtime-session-list.component.css',
})
export class ShowtimeSessionListComponent implements OnInit {

  rap: Rap[] = [];
  phong: Phong[] = [];
  phim: Phim[] = [];
  suatChieu: SuatChieu[] = [];

  // ==== FILTER STATE ====
  selectedCinemaId: string = '';
  selectedRoomId: string = '';
  selectedDate: string = new Date().toISOString().slice(0, 10);

  // ==== PAGINATION ====
  page = 1;
  pageSize = 10;

  // ==== MODAL ====
  isModalOpen = false;
  isEditing = false;
  editingSlot: SuatChieu | null = null;
  slotForm: FormGroup;

  constructor(private fb: FormBuilder, private showtimeService: ShowtimeSessionService) {
    this.slotForm = this.fb.group({
      // Tên control phải khớp với HTML (maPhim, dinhDang, gioBatDau, ...)
      maPhim: ['', Validators.required],
      ngayKetThuc: ['', Validators.required], // Thêm trường mới từ HTML
      dinhDang: ['2D', Validators.required],
      hinhThucDich: ['Phụ đề', Validators.required],
      gioBatDau: ['', Validators.required],
      // Giờ kết thúc vẫn là readonly/disabled nên cần value/disabled options
      gioKetThuc: ['', { value: '', disabled: true }],
      giaCoSo: ['', Validators.required],
    });

    // mỗi khi đổi phim hoặc giờ bắt đầu thì cập nhật giờ kết thúc
    this.slotForm.get('maPhim')?.valueChanges.subscribe(() => this.updateEndTime());
    this.slotForm.get('gioBatDau')?.valueChanges.subscribe(() => this.updateEndTime());
  }

  ngOnInit(): void {
    // 1. Load tất cả dữ liệu rạp, phòng, phim
    this.loadInitialData();

    // 2. Load suất chiếu cho ngày hiện tại
    // Chức năng này sẽ được gọi bên trong loadInitialData hoặc sau khi data có đủ
  }

  // ========= NEW: LOAD INITIAL DATA =========

  private loadInitialData() {
    // Sử dụng forkJoin để tải tất cả dữ liệu cùng lúc
    this.showtimeService.loadAllInitialData()
      .subscribe({
        next: ([rap, phong, phim]) => {
          this.rap = rap;
          this.phong = phong;
          this.phim = phim;

          // Sau khi load xong data, áp dụng bộ lọc ban đầu
          this.applyFilters();
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu ban đầu (Rạp, Phòng, Phim):', err);
          // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi cho người dùng)
        }
      });
  }

  // ========= HELPERS (Cần sửa để lọc từ rooms đã load) =========

  // get filteredRooms(): Phong[] {
  //   const cid = Number(this.selectedCinemaId);
  //   if (!cid) return [];

  //   // Lọc từ mảng rooms đã được load từ API
  //   return this.phong.filter((r) => r.maRap === cid);
  // }

  // ========= HELPERS =========

  private getMovieDuration(movieId: number): number | null {
    const movie = this.phim.find(m => m.id === movieId);
    return movie ? movie.thoiLuong : null;
  }

  private addMinutesToTime(time: string, minutesToAdd: number): string {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    let totalMinutes =
      Number(hStr) * 60 + Number(mStr) + Number(minutesToAdd || 0);

    // nếu vượt qua 24h thì cho quay vòng (tuỳ bạn xử lý)
    totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(h)}:${pad(m)}`;
  }

  private updateEndTime() {
    const movieId = Number(this.slotForm.get('maPhim')?.value);
    const startTime = this.slotForm.get('gioBatDau')?.value as string;

    const duration = this.getMovieDuration(movieId);
    if (!movieId || !startTime || !duration) {
      // không đủ dữ liệu thì clear endTime
      this.slotForm.patchValue({ gioKetThuc: '' }, { emitEvent: false });
      return;
    }

    const end = this.addMinutesToTime(startTime, duration);
    this.slotForm.patchValue({ gioKetThuc: end }, { emitEvent: false });
  }

  get filteredRooms(): Phong[] {
    const cid = Number(this.selectedCinemaId);
    if (!cid) return [];
    return this.phong.filter((r) => r.maRap === cid);
  }

  get currentCinema(): Rap | undefined {
    const cid = Number(this.selectedCinemaId);
    return this.rap.find((c) => c.id === cid);
  }

  get currentRoom(): Phong | undefined {
    const rid = Number(this.selectedRoomId);
    return this.phong.find((r) => r.id === rid);
  }

  getMovieTitle(movieId: number): string {
    return this.phim.find((m) => m.id === movieId)?.tenPhim || '—';
  }

  getMovieStatus(movieId: number): string {
    return this.phim.find((m) => m.id === movieId)?.trangThai || '';
  }

  getSlotStatus(slot: SuatChieu): string {
    const today = new Date().toISOString().slice(0, 10);
    if (slot.ngayBatDau < today) return 'Đã chiếu';
    if (slot.ngayBatDau > today) return 'Sắp chiếu';
    return 'Đang chiếu';
  }

  slotStatusClass(status: string): string {
    switch (status) {
      case 'Đang chiếu':
        return 'badge-live';
      case 'Sắp chiếu':
        return 'badge-upcoming';
      default:
        return 'badge-ended';
    }
  }

  slotTypeClass(type: SlotType): string {
    return type === 'Theo lịch' ? 'badge-regular' : 'badge-special';
  }

  // danh sách slot sau khi lọc
  get filteredSlots(): SuatChieu[] {
    // let data = [...this.suatChieu];

    let data = Array.isArray(this.suatChieu) ? [...this.suatChieu] : [];

    const cid = Number(this.selectedCinemaId);
    const rid = Number(this.selectedRoomId);
    const date = this.selectedDate;


    if (cid) data = data.filter((s) => s.maRap === cid);
    if (rid) data = data.filter((s) => s.maPhong === rid);
    if (date) data = data.filter((s) => s.ngayBatDau === date);

    // sort theo giờ chiếu tăng dần
    data.sort((a, b) => a.gioBatDau.localeCompare(b.gioBatDau));
    return data;
  }

  applyFilters() {
    this.page = 1;
    const cid = Number(this.selectedCinemaId);
    const rid = Number(this.selectedRoomId);
    const date = this.selectedDate;

    // Nếu thiếu rạp hoặc phòng, clear danh sách và không gọi API
    if (!cid || !rid) {
      this.suatChieu = [];
      return;
    }

    // Gọi API để lấy dữ liệu thật
    this.showtimeService.getFilteredSlots(cid, rid, date)
      .subscribe({
        next: (data) => {
          console.log('suat chieu day nè')
          console.log(data)
          this.suatChieu = data;
        },
        error: (err) => {
          console.error('Lỗi khi tải suất chiếu:', err);
          this.suatChieu = []; // Xử lý lỗi: xóa dữ liệu cũ
        }
      });


  }

  // ========= MODAL =========

  openCreateModal() {
    const cid = Number(this.selectedCinemaId);
    const rid = Number(this.selectedRoomId);
    if (!cid || !rid || !this.selectedDate) {
      alert('Vui lòng chọn Rạp chiếu, Phòng chiếu và Ngày chiếu trước.');
      return;
    }

    this.isEditing = false;
    this.editingSlot = null;
    this.slotForm.reset({
      maPhim: '',
      dinhDang: '2D',
      hinhThucDich: 'Phụ đề',
      ngayBatDau: '',
      ngayKetThuc: '',
      gioBatDau: '',
      gioKetThuc: '',
      giaCoSo: '',
    });
    this.isModalOpen = true;
  }

  // openEditModal(slot: SuatChieu) {
  //   this.isEditing = true;
  //   this.editingSlot = slot;

  //   this.selectedCinemaId = String(slot.maRap);
  //   this.selectedRoomId = String(slot.maPhong);
  //   this.selectedDate = slot.ngayBatDau;

  //   this.slotForm.setValue({
  //     maPhim: slot.maPhim,
  //     dinhDang: slot.dinhDang,
  //     hinhThucDich: slot.hinhThucDich,
  //     ngayBatDau: slot.ngayBatDau,
  //     ngayKetThuc: slot.ngayKetThuc,
  //     gioBatDau: slot.gioBatDau,
  //     gioKetThuc: slot.gioKetThuc,
  //     giaCoSo: slot.giaCoSo,
  //     trangThai: slot.trangThai,
  //   });

  //   this.isModalOpen = true;
  // }

  openEditModal(slot: SuatChieu) {
    console.log("form edit")
    console.log(slot)
    this.isEditing = true;
    this.editingSlot = slot;


    this.selectedCinemaId = String(slot.maRap);
    this.selectedRoomId = String(slot.maPhong);
    this.selectedDate = slot.ngayBatDau;


    this.isModalOpen = true;


    this.slotForm.patchValue({
      maPhim: slot.maPhim,
      dinhDang: slot.dinhDang,
      hinhThucDich: slot.hinhThucDich,
      ngayBatDau: slot.ngayBatDau,
      ngayKetThuc: slot.ngayKetThuc,
      gioBatDau: slot.gioBatDau,
      gioKetThuc: slot.gioKetThuc,
      giaCoSo: slot.giaCoSo,
      trangThai: slot.trangThai,
    });

    this.updateEndTime();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // submitSlot() {
  //   if (this.slotForm.invalid) {
  //     this.slotForm.markAllAsTouched();
  //     return;
  //   }

  //   const cid = Number(this.selectedCinemaId);
  //   const rid = Number(this.selectedRoomId);
  //   const date = this.selectedDate;
  //   if (!cid || !rid || !date) {
  //     alert('Thiếu rạp chiếu / phòng chiếu / ngày chiếu.');
  //     return;
  //   }

  //   const value = this.slotForm.value;
  //   // payload cố ý KHÔNG chứa id
  //   const payload: Omit<SuatChieu, 'id'> = {
  //     maRap: cid,
  //     maPhong: rid,
  //     maPhim: Number(value.movieId),
  //     ngayBatDau: date,
  //     dinhDang: value.format,
  //     hinhThucDich: value.language,
  //     gioBatDau: value.startTime,
  //     gioKetThuc: value.endTime,
  //     trangThai: value.slotType,
  //     giaCoSo: Number(value.basePrice)
  //   };

  //   if (this.isEditing && this.editingSlot) {
  //     Object.assign(this.editingSlot, payload);
  //   } else {
  //     const newId =
  //       this.suatChieu.length > 0
  //         ? Math.max(...this.suatChieu.map((s) => s.id)) + 1
  //         : 1;

  //     this.suatChieu.push({
  //       id: newId,
  //       ...payload,
  //     });
  //   }
  //   this.isModalOpen = false;
  // }

  submitSlot() {
    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      return;
    }

    const cid = Number(this.selectedCinemaId);
    const rid = Number(this.selectedRoomId);
    const date = this.selectedDate;
    if (!cid || !rid || !date) {
      alert('Thiếu rạp chiếu / phòng chiếu / ngày chiếu.');
      return;
    }

    // Dùng getRawValue() để lấy giá trị của trường endTime (vì nó là readonly/disabled)
    const value = this.slotForm.getRawValue();

    // Payload cần ánh xạ tới SuatChieuDto của BE
    const payload: Omit<SuatChieu, 'id'> = {
    maRap: cid,
    maPhong: rid,
    maPhim: Number(value.maPhim),
    ngayBatDau: date,        // <--- SỬA
    ngayKetThuc: value.ngayKetThuc,      // <--- SỬA
    dinhDang: value.dinhDang,            // <--- SỬA
    hinhThucDich: value.hinhThucDich,    // <--- SỬA
    gioBatDau: value.gioBatDau,          // <--- SỬA
    gioKetThuc: value.gioKetThuc,        // <--- SỬA
    trangThai: value.trangThai,          
    giaCoSo: Number(value.giaCoSo)
    };

    if (this.isEditing && this.editingSlot) {

      const slotId = this.editingSlot.id; // <--- CÓ PHẢI NÓ LÀ undefined KHÔNG?

      if (!slotId) {
        alert('Lỗi: Không tìm thấy ID suất chiếu đang chỉnh sửa.');
        return;
      }
      // 1. CHỨC NĂNG CẬP NHẬT (API: PUT)
      this.showtimeService.updateSlot(this.editingSlot.id, payload)
        .subscribe({
          next: (updatedSlot) => {
            // Thay thế bản ghi cũ bằng bản ghi mới từ BE
            const index = this.suatChieu.findIndex(s => s.id === updatedSlot.id);
            if (index > -1) {
              this.suatChieu[index] = updatedSlot;
            }
            this.closeModal();
          },
          error: (error: HttpErrorResponse) => {
            console.error('Lỗi khi cập nhật suất chiếu:', error);
            alert(`Cập nhật thất bại: ${error.error.message || error.statusText}`);
          }
        });
    } else {
      // 2. CHỨC NĂNG TẠO MỚI (API: POST)
      this.showtimeService.createSlot(payload)
        .subscribe({
          next: (newSlot) => {
            // Thêm bản ghi mới (có ID thật) vào mảng FE
            this.suatChieu.push(newSlot);
            this.closeModal();
            // Lọc lại hoặc gọi applyFilters() nếu cần thiết
            // this.applyFilters(); 
          },
          error: (error: HttpErrorResponse) => {
            console.error('Lỗi khi tạo suất chiếu:', error);
            alert(`Tạo mới thất bại: ${error.error.message || error.statusText}`);
          }
        });
    }
  }

  deleteSlot(slot: SuatChieu) {
    if (!confirm('Bạn chắc chắn muốn xoá suất chiếu này?')) return;
    this.suatChieu = this.suatChieu.filter((s) => s.id !== slot.id);
  }

  refresh() {
    // chừa sẵn để call API
    console.log('refresh screening slots...');
  }
}
