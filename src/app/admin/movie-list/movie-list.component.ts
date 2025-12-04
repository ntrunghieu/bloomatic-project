import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MovieService, AdminMovieRow, PageResponse } from '../../services/movie/movie.service'; // chỉnh path

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent implements OnInit {

  page = 1;          // trang hiện tại (1-based cho UI)
  pageSize = 12;      // số dòng / trang
  pages: number[] = [];

  movies: AdminMovieRow[] = [];
  totalElements = 0;
  loading = false;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
    console.log('ds phim');
    console.log(this.movies);
  }

  /** Gọi API lấy danh sách phim */
  loadMovies(): void {
    this.loading = true;

    // BE dùng page 0-based, nên trừ 1
    const pageIndex = this.page - 1;

    this.movieService.getMoviesAdmin(pageIndex, this.pageSize).subscribe({
      next: (res: PageResponse<AdminMovieRow>) => {

        console.log('Dữ liệu PageResponse trả về từ BE:', res);
        this.movies = res.content;
        this.totalElements = res.totalElements;

        const totalPages = res.totalPages;
        this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        this.loading = false;
      },
      error: err => {
        console.error('Lỗi load danh sách phim:', err);
        this.loading = false;
      }
    });
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.pages.length) return;
    this.page = p;
    this.loadMovies();
  }

  prevPage(): void {
    this.goToPage(this.page - 1);
  }

  nextPage(): void {
    this.goToPage(this.page + 1);
  }

  onRefresh(): void {
    this.loadMovies();
  }

  /** Xóa phim từ danh sách */
  onDelete(movie: AdminMovieRow): void {
    const confirmDelete = confirm(`Bạn có chắc muốn xóa phim "${movie.name}" không?`);
    if (!confirmDelete) return;

    this.movieService.deleteMovie(movie.id).subscribe({
      next: () => {
        alert('Xóa phim thành công');
        // nếu trang hiện tại trống sau khi xóa, có thể lùi 1 trang
        if (this.movies.length === 1 && this.page > 1) {
          this.page = this.page - 1;
        }
        this.loadMovies();
      },
      error: err => {
        console.error('Lỗi xóa phim:', err);
        alert('Xóa phim thất bại');
      }
    });
  }
}
