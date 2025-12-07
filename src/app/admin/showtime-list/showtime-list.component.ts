import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ShowtimeService } from '../../services/showtime/showtime.service';

type ShowtimeStatus = 'Sắp chiếu' | 'Đang chiếu' | 'Đã chiếu';

interface MovieOption {
  id: number;
  tenPhim: string;
}

// interface AdminShowtime {
//   id: number;
//   movieId: number;
//   startDate: string; 
//   endDate: string;   
// }

export interface LichChieuDto {
  id: number;
  maPhim: number;
  startDate: string;
  endDate: string;
  // basePrice: number; 
}

@Component({
  selector: 'app-showtime-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './showtime-list.component.html',
  styleUrl: './showtime-list.component.css',
})
export class ShowtimeListComponent implements OnInit {

  movies: MovieOption[] = [];
  filteredMovies: MovieOption[] = [];
  showtimes: LichChieuDto[] = [];
  isLoading = true;

  // lọc + phân trang
  searchTerm = '';
  page = 1;
  pageSize = 10;

  sortField: 'date' | 'status' | '' = '';
  sortDir: 'asc' | 'desc' = 'asc';

  // modal
  isModalOpen = false;
  isEditing = false;
  editingShowtime: LichChieuDto | null = null;
  showtimeForm: FormGroup;

  constructor(private fb: FormBuilder, private showtimeService: ShowtimeService) {
    this.showtimeForm = this.fb.group({
      maPhim: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  // loadData() {
  //   this.isLoading = true;

  //   // 1. Lấy danh sách phim
  //   this.showtimeService.getMovies().subscribe({
  //     next: (data) => {
  //       this.movies = data;
  //       // console.log('Loaded movies:', this.movies);
  //     },
  //     error: (err) => {
  //       console.error('Lỗi khi tải danh sách phim', err);
  //       // Có thể thêm thông báo lỗi ở đây
  //     }
  //   });

  //   // 2. Lấy danh sách lịch chiếu
  //   this.showtimeService.getShowtimes().subscribe({
  //     next: (data) => {
  //       this.showtimes = data;
  //       this.isLoading = false;
  //       // console.log('Loaded showtimes:', this.showtimes);
  //     },
  //     error: (err) => {
  //       console.error('Lỗi khi tải danh sách lịch chiếu', err);
  //       this.isLoading = false;
  //       // Có thể thêm thông báo lỗi ở đây
  //     }
  //   });
  // }

  loadData() {
    this.isLoading = true;

    // Cần đảm bảo hàm lọc chỉ chạy sau khi cả 2 API đã hoàn thành
    let moviesLoaded = false;
    let showtimesLoaded = false;

    const checkAndFilter = () => {
        if (moviesLoaded && showtimesLoaded) {
            this.isLoading = false;
            this.filterAvailableMovies(); // Gọi filter sau khi cả 2 đã load
        }
    }

    // 1. Lấy danh sách phim
    this.showtimeService.getMovies().subscribe({
      next: (data) => {
        this.movies = data;
        moviesLoaded = true;
        checkAndFilter();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách phim', err);
        moviesLoaded = true; 
        checkAndFilter();
      }
    });

    // 2. Lấy danh sách lịch chiếu
    this.showtimeService.getShowtimes().subscribe({
      next: (data) => {
        this.showtimes = data;
        showtimesLoaded = true;
        checkAndFilter();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách lịch chiếu', err);
        showtimesLoaded = true;
        checkAndFilter();
      }
    });
  }

  filterAvailableMovies(editingMovieId: number | null = null) {
      // 1. Lấy danh sách maPhim đã có lịch chiếu
      const existingMovieIds = new Set<number>();
      this.showtimes.forEach(st => {
          // Bỏ qua phim của lịch chiếu đang được chỉnh sửa
          if (editingMovieId !== null && st.maPhim === editingMovieId) {
              return; 
          }
          existingMovieIds.add(st.maPhim);
      });

      // 2. Lọc danh sách phim ban đầu
      this.filteredMovies = this.movies.filter(movie => {
          // Phim hợp lệ nếu maPhim của nó không nằm trong existingMovieIds
          return !existingMovieIds.has(movie.id);
      });

      // 3. Nếu đang chỉnh sửa, đảm bảo phim hiện tại có trong danh sách
      if (editingMovieId !== null) {
          const isPresent = this.filteredMovies.some(m => m.id === editingMovieId);
          if (!isPresent) {
               const currentMovie = this.movies.find(m => m.id === editingMovieId);
               if (currentMovie) {
                   this.filteredMovies.push(currentMovie);
                   this.filteredMovies.sort((a, b) => a.tenPhim.localeCompare(b.tenPhim));
               }
          }
      }
  }



  // ====== helpers trạng thái / text ======

  getMovieTitle(movieId: number): string {
    return this.movies.find((m) => m.id === movieId)?.tenPhim || '—';
  }

  getStatus(s: LichChieuDto): ShowtimeStatus {
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

  get filteredShowtimes(): LichChieuDto[] {
    let data = [...this.showtimes];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      data = data.filter((s) =>
        this.getMovieTitle(s.maPhim).toLowerCase().includes(term)
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
      maPhim: '',
      startDate: '',
      endDate: '',
      // basePrice: 0,
    });
    this.filterAvailableMovies();
    this.isModalOpen = true;
  }

  openEditModal(st: LichChieuDto) {
    this.isEditing = true;
    this.editingShowtime = st;
    this.showtimeForm.setValue({
      maPhim: st.maPhim,
      startDate: st.startDate,
      endDate: st.endDate,
      // basePrice: st.basePrice,
    });
    this.filterAvailableMovies();
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

    // const formValue = this.showtimeForm.value;
    // const maPhim = Number(formValue.maPhim);
    // const startDate = formValue.startDate as string;
    // const endDate = formValue.endDate as string;

    const formValue = this.showtimeForm.value;
    console.log('lich chieu');
    console.log(formValue);
    const dataToSend: Omit<LichChieuDto, 'id'> = {
      maPhim: Number(formValue.maPhim),
      startDate: formValue.startDate as string,
      endDate: formValue.endDate as string,
      // basePrice: Number(formValue.basePrice),
    };
    console.log(dataToSend);

    if (this.isEditing && this.editingShowtime) {
      // this.editingShowtime.maPhim = maPhim;
      // this.editingShowtime.startDate = startDate;
      // this.editingShowtime.endDate = endDate;
      this.showtimeService.updateShowtime(this.editingShowtime.id, dataToSend).subscribe({
        next: () => {
          this.closeModal();
          this.loadData(); // Tải lại danh sách sau khi cập nhật thành công
        },
        error: (err) => console.error('Lỗi khi cập nhật lịch chiếu:', err)
      });
    } else {
      // const newId =
      //   this.showtimes.length > 0
      //     ? Math.max(...this.showtimes.map((s) => s.id)) + 1
      //     : 1;

      // this.showtimes.push({
      //   id: newId,
      //   maPhim,
      //   startDate,
      //   endDate,
      // });

      this.showtimeService.createShowtime(dataToSend).subscribe({
        next: () => {
          this.closeModal();
          this.loadData(); // Tải lại danh sách sau khi tạo mới thành công
        },
        error: (err) => console.error('Lỗi khi tạo lịch chiếu:', err)
      });
    }

    this.isModalOpen = false;
  }

  deleteShowtime(st: LichChieuDto) {
    if (!confirm('Bạn chắc chắn muốn xoá lịch chiếu này?')) return;
    // this.showtimes = this.showtimes.filter((s) => s.id !== st.id);
    this.showtimeService.deleteShowtime(st.id).subscribe({
      next: () => {
        // Cập nhật local list hoặc tải lại data
        this.showtimes = this.showtimes.filter((s) => s.id !== st.id);
      },
      error: (err) => console.error('Lỗi khi xoá lịch chiếu:', err)
    });
  }

  refresh() {
    this.loadData();
    console.log('refresh showtimes...');
  }
}
