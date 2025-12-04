import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CinemaService, RapDto } from '../../services/cinema/cinema.service';

export interface Cinema {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

@Component({
  selector: 'app-cinema-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './cinema-list.component.html',
  styleUrls: ['./cinema-list.component.css'],
})
export class CinemaListComponent {
  cinemas: RapDto[] = [];
  // cinemas: Cinema[] = [
  //   {
  //     id: 1,
  //     name: 'HCinema Hà Nội Centerpoint',
  //     address:
  //       'Tầng 5 TTTM Hà Nội Centerpoint, 27 Lê Văn Lương (Số 85 Lê Văn Lương cũ), Phường Nhân Chính, Quận Thanh Xuân, TP Hà Nội',
  //     createdAt: '2024-03-10',
  //   },
  //   {
  //     id: 2,
  //     name: 'HCinema Mac Plaza (Hacinco)',
  //     address:
  //       'Tầng 7, Trung tâm thương mại Mac Plaza, 10 Trần Phú, Hà Đông, Hà Nội',
  //     createdAt: '2024-03-10',
  //   },
  //   {
  //     id: 3,
  //     name: 'HCinema Vincom Royal City',
  //     address:
  //       'Tầng B2 - Khu R4, TTTM Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
  //     createdAt: '2024-03-10',
  //   },
  //   {
  //     id: 4,
  //     name: 'HCinema Vincom Ocean Park',
  //     address:
  //       'Tầng 4, Trung Tâm Thương Mại Vincom Ocean Park, Huyện Gia Lâm, Hà Nội',
  //     createdAt: '2024-03-10',
  //   },
  //   {
  //     id: 5,
  //     name: 'HCinema Aeon Hà Đông',
  //     address:
  //       'Tầng 3 & 4 – TTTM AEON MALL Hà Đông, P. Dương Nội, Q. Hà Đông, Hà Nội',
  //     createdAt: '2024-03-10',
  //   },
  // ];

  // phân trang
  page = 1;
  itemsPerPage = 10;

  loading = false;
  error: string | null = null;

  constructor(private router: Router, private cinemaService: CinemaService) {}

  ngOnInit(): void {
    this.loadCinemas();
  }

  /** Gọi API lấy danh sách rạp từ BE */
  loadCinemas(): void {
    this.loading = true;
    this.error = null;

    this.cinemaService.danhSachRap().subscribe({
      next: (list: RapDto[]) => {
        this.cinemas = list.map((rap) => ({
          id: rap.id,
          tenRap: rap.tenRap,
          diaChi: rap.diaChi,
          createdAt: rap.createdAt,
        }));
        this.loading = false;
        console.log(this.cinemas);
      },
      error: (err) => {
        console.error('Lỗi load danh sách rạp:', err);
        this.error = 'Không tải được danh sách rạp chiếu.';
        this.loading = false;
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN');
  }

  goCreate() {
    this.router.navigate(['/admin/cinemas/create']);
  }

  refresh() {
    this.loadCinemas();
  }

  openDetail(r: RapDto) {
    console.log(r.id);
    this.router.navigate(['/admin/cinemas', r.id]);
  }
}
