// src/app/admin/showtime-session-list/showtime-session-list.component.ts
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

interface Cinema {
  id: number;
  name: string;
}

interface Room {
  id: number;
  cinemaId: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  status: 'Đang chiếu' | 'Sắp chiếu' | 'Đã chiếu';
  duration: number;
}

type SlotType = 'Theo lịch' | 'Suất đặc biệt';
type SlotStatus = 'Đang chiếu' | 'Sắp chiếu' | 'Đã chiếu';

interface ScreeningSlot {
  id: number;
  cinemaId: number;
  roomId: number;
  movieId: number;
  showDate: string;   // yyyy-MM-dd
  format: string;     // 2D, 3D, IMAX...
  language: string;   // Phụ đề, Thuyết minh...
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  slotType: SlotType;
  basePrice: number;
}

@Component({
  selector: 'app-showtime-session-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule, CurrencyPipe],
  templateUrl: './showtime-session-list.component.html',
  styleUrl: './showtime-session-list.component.css',
})
export class ShowtimeSessionListComponent {
  // ==== MOCK DATA ====
  cinemas: Cinema[] = [
    { id: 1, name: 'HCinema Aeon Hà Đông' },
    { id: 2, name: 'HCinema Vincom Đà Nẵng' },
  ];

  rooms: Room[] = [
    { id: 1, cinemaId: 1, name: 'Cinema 1' },
    { id: 2, cinemaId: 1, name: 'Cinema 2' },
    { id: 3, cinemaId: 2, name: 'Cinema 4' },
  ];

  movies: Movie[] = [
    {
      id: 1, title: 'Ta Khúc Triệu Vọng', status: 'Đang chiếu',
      duration: 120
    },
    {
      id: 2, title: 'Kẻ Thứ Thần', status: 'Đang chiếu',
      duration: 140
    },
    {
      id: 3, title: 'Người "Bạn" Trong Tưởng Tượng', status: 'Sắp chiếu',
      duration: 150
    },
    {
      id: 4, title: 'Cái Giá Của Hạnh Phúc', status: 'Đã chiếu',
      duration: 90
    },
  ];

  slots: ScreeningSlot[] = [
    {
      id: 1,
      cinemaId: 1,
      roomId: 1,
      movieId: 1,
      showDate: '2025-05-16',
      format: '2D',
      language: 'Phụ đề',
      startTime: '08:00',
      endTime: '09:45',
      slotType: 'Theo lịch',
      basePrice: 100000,
    },
    {
      id: 2,
      cinemaId: 1,
      roomId: 1,
      movieId: 2,
      showDate: '2025-05-16',
      format: '2D',
      language: 'Phụ đề',
      startTime: '10:20',
      endTime: '12:05',
      slotType: 'Theo lịch',
      basePrice: 100000,
    },
    {
      id: 3,
      cinemaId: 1,
      roomId: 1,
      movieId: 3,
      showDate: '2025-05-16',
      format: '2D',
      language: 'Phụ đề',
      startTime: '14:45',
      endTime: '16:30',
      slotType: 'Theo lịch',
      basePrice: 100000,
    },
    {
      id: 4,
      cinemaId: 1,
      roomId: 2,
      movieId: 4,
      showDate: '2025-05-16',
      format: '2D',
      language: 'Phụ đề',
      startTime: '19:30',
      endTime: '21:15',
      slotType: 'Suất đặc biệt',
      basePrice: 100000,
    },
  ];

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
  editingSlot: ScreeningSlot | null = null;
  slotForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.slotForm = this.fb.group({
      movieId: ['', Validators.required],
      format: ['2D', Validators.required],
      language: ['Phụ đề', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      basePrice: ['', Validators.required],
      // slotType: ['Theo lịch', Validators.required],
    });

    // mỗi khi đổi phim hoặc giờ bắt đầu thì cập nhật giờ kết thúc
    this.slotForm.get('movieId')?.valueChanges.subscribe(() => this.updateEndTime());
    this.slotForm.get('startTime')?.valueChanges.subscribe(() => this.updateEndTime());
  }

  // ========= HELPERS =========

  private getMovieDuration(movieId: number): number | null {
    const movie = this.movies.find(m => m.id === movieId);
    return movie ? movie.duration : null;
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
    const movieId = Number(this.slotForm.get('movieId')?.value);
    const startTime = this.slotForm.get('startTime')?.value as string;

    const duration = this.getMovieDuration(movieId);
    if (!movieId || !startTime || !duration) {
      // không đủ dữ liệu thì clear endTime
      this.slotForm.patchValue({ endTime: '' }, { emitEvent: false });
      return;
    }

    const end = this.addMinutesToTime(startTime, duration);
    this.slotForm.patchValue({ endTime: end }, { emitEvent: false });
  }

  get filteredRooms(): Room[] {
    const cid = Number(this.selectedCinemaId);
    if (!cid) return [];
    return this.rooms.filter((r) => r.cinemaId === cid);
  }

  get currentCinema(): Cinema | undefined {
    const cid = Number(this.selectedCinemaId);
    return this.cinemas.find((c) => c.id === cid);
  }

  get currentRoom(): Room | undefined {
    const rid = Number(this.selectedRoomId);
    return this.rooms.find((r) => r.id === rid);
  }

  getMovieTitle(movieId: number): string {
    return this.movies.find((m) => m.id === movieId)?.title || '—';
  }

  getMovieStatus(movieId: number): string {
    return this.movies.find((m) => m.id === movieId)?.status || '';
  }

  getSlotStatus(slot: ScreeningSlot): SlotStatus {
    const today = new Date().toISOString().slice(0, 10);
    if (slot.showDate < today) return 'Đã chiếu';
    if (slot.showDate > today) return 'Sắp chiếu';
    return 'Đang chiếu';
  }

  slotStatusClass(status: SlotStatus): string {
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
  get filteredSlots(): ScreeningSlot[] {
    let data = [...this.slots];

    const cid = Number(this.selectedCinemaId);
    const rid = Number(this.selectedRoomId);
    const date = this.selectedDate;

    if (cid) data = data.filter((s) => s.cinemaId === cid);
    if (rid) data = data.filter((s) => s.roomId === rid);
    if (date) data = data.filter((s) => s.showDate === date);

    // sort theo giờ chiếu tăng dần
    data.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return data;
  }

  applyFilters() {
    this.page = 1;
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
      movieId: '',
      format: '2D',
      language: 'Phụ đề',
      startTime: '',
      endTime: '',
      slotType: 'Theo lịch',
    });
    this.isModalOpen = true;
  }

  openEditModal(slot: ScreeningSlot) {
    this.isEditing = true;
    this.editingSlot = slot;

    this.selectedCinemaId = String(slot.cinemaId);
    this.selectedRoomId = String(slot.roomId);
    this.selectedDate = slot.showDate;

    this.slotForm.setValue({
      movieId: slot.movieId,
      format: slot.format,
      language: slot.language,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotType: slot.slotType,
    });

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

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

    const value = this.slotForm.value;
    // payload cố ý KHÔNG chứa id
    const payload: Omit<ScreeningSlot, 'id'> = {
      cinemaId: cid,
      roomId: rid,
      movieId: Number(value.movieId),
      showDate: date,
      format: value.format,
      language: value.language,
      startTime: value.startTime,
      endTime: value.endTime,
      slotType: value.slotType,
      basePrice: Number(value.basePrice)
    };

    if (this.isEditing && this.editingSlot) {
      Object.assign(this.editingSlot, payload);
    } else {
      const newId =
        this.slots.length > 0
          ? Math.max(...this.slots.map((s) => s.id)) + 1
          : 1;

      this.slots.push({
        id: newId,
        ...payload,
      });
    }


    this.isModalOpen = false;
  }

  deleteSlot(slot: ScreeningSlot) {
    if (!confirm('Bạn chắc chắn muốn xoá suất chiếu này?')) return;
    this.slots = this.slots.filter((s) => s.id !== slot.id);
  }

  refresh() {
    // chừa sẵn để call API
    console.log('refresh screening slots...');
  }
}
