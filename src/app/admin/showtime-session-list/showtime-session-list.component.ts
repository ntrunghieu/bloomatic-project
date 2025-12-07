// src/app/admin/showtime-session-list/showtime-session-list.component.ts
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
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

export interface LichChieuDto {
  id: number;
  maPhim: number;
  startDate: string; 
  endDate: string;   
}

interface SuatChieu {
  id: number;
  maRap: number;
  maPhong: number;
  maPhim: number;
  ngayChieu: string;
  // ngayKetThuc: string;
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
  lichChieuList: LichChieuDto[] = [];

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

  // ==== TOASTER STATE ====
  toasterMessage: string = '';
  isToasterVisible: boolean = false;
  toasterType: 'success' | 'error' | 'info' = 'info';

  static validateStartTime(selectedDate: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.value as string; // Giá trị: "HH:mm"

      // 1. Thoát nếu không có giá trị
      if (!startTime || !selectedDate) {
        return null;
      }

      const today = new Date();
      // Chuyển đổi selectedDate thành đối tượng Date để so sánh ngày
      // Lưu ý: new Date(ISO_DATE) sẽ mặc định là 00:00:00 UTC, cần dùng cách so sánh ngày chính xác
      const selectedDateString = new Date(selectedDate).toDateString();
      const todayDateString = today.toDateString();


      // 2. Nếu ngày được chọn KHÔNG phải là ngày hôm nay, Validator HỢP LỆ (return null)
      if (selectedDateString !== todayDateString) {
        return null;
      }

      // 3. Nếu LÀ ngày hôm nay, tiến hành kiểm tra giờ
      const [h, m] = startTime.split(':').map(Number);

      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();

      // So sánh giờ: Nếu Giờ chọn < Giờ hiện tại HOẶC (Giờ chọn = Giờ hiện tại VÀ Phút chọn <= Phút hiện tại)
      if (h < currentHour || (h === currentHour && m <= currentMinute)) {
        return { 'startTimePast': true };
      }

      // 4. Giờ hợp lệ
      return null;
    };
  }

  constructor(private fb: FormBuilder, private showtimeService: ShowtimeSessionService) {
    const initialDate = new Date().toISOString().slice(0, 10);

    this.slotForm = this.fb.group({
      // Tên control phải khớp với HTML (maPhim, dinhDang, gioBatDau, ...)
      // id: ['', Validators.required],
      maPhim: ['', Validators.required],
      ngayChieu: ['', Validators.required], 
      dinhDang: ['2D', Validators.required],
      hinhThucDich: ['Phụ đề', Validators.required],
      gioBatDau: [
        '',
        [
          Validators.required,
          ShowtimeSessionListComponent.validateStartTime(initialDate)
        ]
      ],
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

  private showToaster(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toasterMessage = message;
    this.toasterType = type;
    this.isToasterVisible = true;

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      this.isToasterVisible = false;
    }, 3000);
  }

  private getLichChieuIdByPhimId(maPhim: number, ngayChieu: string): number | null {
      // Ngày chiếu đang được chọn (YYYY-MM-DD)
      const currentDate = ngayChieu; 
      
      // Tìm LichChieu có maPhim tương ứng VÀ ngày chiếu nằm trong khoảng startDate/endDate
      const foundSchedule = this.lichChieuList.find(lc => 
          lc.maPhim === maPhim &&
          lc.startDate <= currentDate && // Ngày bắt đầu <= Ngày hiện tại
          lc.endDate >= currentDate     // Ngày kết thúc >= Ngày hiện tại
      );
      
      return foundSchedule ? foundSchedule.id : null;
  }

  private updateStartTimeValidator() {
    const startTimeControl = this.slotForm.get('gioBatDau');
    if (startTimeControl) {
      startTimeControl.setValidators([
        Validators.required,
        ShowtimeSessionListComponent.validateStartTime(this.selectedDate) // Dùng selectedDate
      ]);
      startTimeControl.updateValueAndValidity(); // Kích hoạt chạy validator ngay lập tức
    }
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
    if (slot.ngayChieu < today) return 'Đã chiếu';
    if (slot.ngayChieu > today) return 'Sắp chiếu';
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
    if (date) data = data.filter((s) => s.ngayChieu === date);

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
      this.showToaster('Vui lòng chọn Rạp chiếu, Phòng chiếu và Ngày chiếu trước.', 'error');
      return;
    }

    this.isEditing = false;
    this.editingSlot = null;
    this.slotForm.reset({
      maPhim: '',
      dinhDang: '2D',
      hinhThucDich: 'Phụ đề',
      ngayChieu: this.selectedDate,
      // ngayKetThuc: '',
      gioBatDau: '',
      gioKetThuc: '',
      giaCoSo: '',
    });
    this.isModalOpen = true;
    this.updateStartTimeValidator();
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
    this.selectedDate = slot.ngayChieu;


    this.isModalOpen = true;


    this.slotForm.patchValue({

      maPhim: slot.maPhim,
      dinhDang: slot.dinhDang,
      hinhThucDich: slot.hinhThucDich,
      ngayChieu: slot.ngayChieu,
      // ngayKetThuc: slot.ngayKetThuc,
      gioBatDau: slot.gioBatDau,
      gioKetThuc: slot.gioKetThuc,
      giaCoSo: slot.giaCoSo,
      trangThai: slot.trangThai,
    });

    this.updateEndTime();
    this.updateStartTimeValidator();
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
    console.log(this.slotForm.value)
    console.log(this.selectedRoomId)

    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      this.showToaster('Vui lòng điền đầy đủ và chính xác thông tin suất chiếu.', 'error');
      alert('Vui lòng điền đầy đủ và chính xác thông tin suất chiếu.');
      return;
    }

    const cid = Number(this.selectedCinemaId);
    const rid = Number(this.selectedRoomId);
    const date = this.selectedDate;
    if (!cid || !rid || !date) {
      this.showToaster('Thiếu rạp chiếu / phòng chiếu / ngày chiếu.', 'error');
      alert('Thiếu rạp chiếu / phòng chiếu / ngày chiếu.');
      return;
    }

    // Dùng getRawValue() để lấy giá trị của trường endTime (vì nó là readonly/disabled)
    const value = this.slotForm.getRawValue();
    // Gán trạng thái mặc định là 'Sắp chiếu' hoặc dùng hàm tính toán
    const status = this.getSlotStatus({ ngayChieu: date } as SuatChieu);
   

    // Payload cần ánh xạ tới SuatChieuDto của BE
    const payload: Omit<SuatChieu, 'id'> = {
      maRap: cid,
      maPhong: rid,
      maPhim: Number(value.maPhim),
      ngayChieu: date,        // <--- SỬA
      // ngayKetThuc: value.ngayKetThuc,      
      dinhDang: value.dinhDang,            // <--- SỬA
      hinhThucDich: value.hinhThucDich,    // <--- SỬA
      gioBatDau: value.gioBatDau,          // <--- SỬA
      gioKetThuc: value.gioKetThuc,        // <--- SỬA
      // trangThai: value.trangThai, 
      trangThai: status,
      giaCoSo: Number(value.giaCoSo)
    };

    if (this.isEditing && this.editingSlot) {

      const slotId = this.editingSlot.id; // <--- CÓ PHẢI NÓ LÀ undefined KHÔNG?

      if (!slotId) {
        this.showToaster('Lỗi: Không tìm thấy ID suất chiếu đang chỉnh sửa.', 'error');
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
            this.showToaster('Cập nhật suất chiếu thành công!', 'success'); // TOASTER SUCCESS
            this.closeModal();
            alert( 'Cập nhật suất chiếu thành công!');
          },
          error: (error: HttpErrorResponse) => {
            const errorMessage = error.error?.message || error.statusText;
            this.showToaster(errorMessage, 'error');
            alert( errorMessage);
          }
        });
    } else {
      console.error('Thêm suất chiếuu:');
      console.error(payload);
      // 2. CHỨC NĂNG TẠO MỚI (API: POST)
      this.showtimeService.createSlot(payload)
        .subscribe({
          next: (newSlot) => {
            // Thêm bản ghi mới (có ID thật) vào mảng FE
            this.suatChieu.push(newSlot);
            this.showToaster('Tạo suất chiếu mới thành công!', 'success'); // TOASTER SUCCESS
            this.closeModal();
            // Lọc lại hoặc gọi applyFilters() nếu cần thiết
            // this.applyFilters(); 
          },
          error: (error: HttpErrorResponse) => {
            console.error('Lỗi khi tạo suất chiếu:', error);
            const errorMessage = error.error?.message || error.statusText;
            this.showToaster(errorMessage, 'error');
            alert( errorMessage);
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
