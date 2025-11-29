import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

type ShowtimeStatus = 'Sắp chiếu' | 'Đang chiếu' | 'Đã chiếu';

interface MovieOption {
  id: number;
  title: string;
}

interface AdminShowtime {
  id: number;
  movieId: number;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
}

@Component({
  selector: 'app-showtime-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './showtime-list.component.html',
  styleUrl: './showtime-list.component.css',
})
export class ShowtimeListComponent {
  // mock danh sách phim – sau này thay bằng API
  movies: MovieOption[] = [
    { id: 1, title: 'Mickey 17' },
    { id: 2, title: 'Joker: Folie à Deux – Điên Có Đôi' },
    { id: 3, title: 'Những Mảnh Ghép Cảm Xúc 2' },
    { id: 4, title: 'Garfield – Mèo Béo Siêu Quậy' },
    { id: 5, title: 'Kẻ Thứ Thần' },
  ];

  // mock lịch chiếu
  showtimes: AdminShowtime[] = [
    {
      id: 1,
      movieId: 1,
      startDate: '2025-02-28',
      endDate: '2025-03-23',      
    },
    {
      id: 2,
      movieId: 2,
      startDate: '2024-10-04',
      endDate: '2024-11-10',

    },
    {
      id: 3,
      movieId: 3,
      startDate: '2024-06-14',
      endDate: '2024-07-28',

    },
    {
      id: 4,
      movieId: 4,
      startDate: '2024-05-31',
      endDate: '2024-06-09',

    },
    {
      id: 5,
      movieId: 5,
      startDate: '2024-05-03',
      endDate: '2024-06-02',

    },
  ];

  // lọc + phân trang
  searchTerm = '';
  page = 1;
  pageSize = 10;

  sortField: 'date' | 'status' | '' = '';
  sortDir: 'asc' | 'desc' = 'asc';

  // modal
  isModalOpen = false;
  isEditing = false;
  editingShowtime: AdminShowtime | null = null;
  showtimeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.showtimeForm = this.fb.group({
      movieId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  // ====== helpers trạng thái / text ======

  getMovieTitle(movieId: number): string {
    return this.movies.find((m) => m.id === movieId)?.title || '—';
  }

  getStatus(s: AdminShowtime): ShowtimeStatus {
    const today = new Date().toISOString().slice(0, 10);
    if (s.endDate < today) return 'Đã chiếu';
    if (s.startDate > today) return 'Sắp chiếu';
    return 'Đang chiếu';
  }

  statusRank(status: ShowtimeStatus): number {
    switch (status) {
      case 'Sắp chiếu':
        return 0;
      case 'Đang chiếu':
        return 1;
      default:
        return 2;
    }
  }

  statusClass(status: ShowtimeStatus): string {
    switch (status) {
      case 'Đang chiếu':
        return 'badge-live';
      case 'Sắp chiếu':
        return 'badge-upcoming';
      default:
        return 'badge-ended';
    }
  }

  // ====== lọc + sort ======

  get filteredShowtimes(): AdminShowtime[] {
    let data = [...this.showtimes];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      data = data.filter((s) =>
        this.getMovieTitle(s.movieId).toLowerCase().includes(term)
      );
    }

    if (this.sortField) {
      data.sort((a, b) => {
        if (this.sortField === 'date') {
          const da = a.startDate;
          const db = b.startDate;
          return this.sortDir === 'asc'
            ? da.localeCompare(db)
            : db.localeCompare(da);
        }

        if (this.sortField === 'status') {
          const sa = this.statusRank(this.getStatus(a));
          const sb = this.statusRank(this.getStatus(b));
          return this.sortDir === 'asc' ? sa - sb : sb - sa;
        }

        return 0;
      });
    }

    return data;
  }

  toggleSort(field: 'date' | 'status') {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
  }

  // ====== modal create / edit ======

  openCreateModal() {
    this.isEditing = false;
    this.editingShowtime = null;
    this.showtimeForm.reset({
      movieId: '',
      startDate: '',
      endDate: '',
    });
    this.isModalOpen = true;
  }

  openEditModal(st: AdminShowtime) {
    this.isEditing = true;
    this.editingShowtime = st;
    this.showtimeForm.setValue({
      movieId: st.movieId,
      startDate: st.startDate,
      endDate: st.endDate,
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  submitShowtime() {
    if (this.showtimeForm.invalid) {
      this.showtimeForm.markAllAsTouched();
      return;
    }

    const formValue = this.showtimeForm.value;
    const movieId = Number(formValue.movieId);
    const startDate = formValue.startDate as string;
    const endDate = formValue.endDate as string;

    if (this.isEditing && this.editingShowtime) {
      this.editingShowtime.movieId = movieId;
      this.editingShowtime.startDate = startDate;
      this.editingShowtime.endDate = endDate;
    } else {
      const newId =
        this.showtimes.length > 0
          ? Math.max(...this.showtimes.map((s) => s.id)) + 1
          : 1;

      this.showtimes.push({
        id: newId,
        movieId,
        startDate,
        endDate,
      });
    }

    this.isModalOpen = false;
  }

  deleteShowtime(st: AdminShowtime) {
    if (!confirm('Bạn chắc chắn muốn xoá lịch chiếu này?')) return;
    this.showtimes = this.showtimes.filter((s) => s.id !== st.id);
  }

  refresh() {
    // chừa sẵn để sau này gọi API
    console.log('refresh showtimes...');
  }
}
