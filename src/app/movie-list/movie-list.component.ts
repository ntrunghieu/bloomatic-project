import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MovieItem {
  id: number;
  title: string;
  genres: string[];
  country: string;
  year: number;
  posterUrl: string;
  ageBadge?: string; // ví dụ: "13+", "16+"
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent {
  // dữ liệu demo – sau này bạn thay bằng data từ API
  movies: MovieItem[] = [
    {
      id: 1,
      title: 'Từ "Thính" Thành Yêu',
      genres: ['Chính kịch'],
      country: 'Việt Nam',
      year: 2025,
      posterUrl: 'assets/posters/thu-thinh-thanh-yeu.jpg',
      ageBadge: '13+'
    },
    {
      id: 2,
      title: 'Điệp Viên Stone',
      genres: ['Hành động'],
      country: 'Mỹ',
      year: 2024,
      posterUrl: 'assets/posters/heart-of-stone.jpg',
      ageBadge: '16+'
    },
    {
      id: 3,
      title: 'Ma Trận',
      genres: ['Khoa học viễn tưởng', 'Hành động'],
      country: 'Mỹ',
      year: 2021,
      posterUrl: 'assets/posters/matran.jpg',
      ageBadge: '16+'
    },
    {
      id: 4,
      title: 'Cô Gái Trong Lưới Nhện Ảo',
      genres: ['Gay cấn', 'Hình sự'],
      country: 'Mỹ',
      year: 2018,
      posterUrl: 'assets/posters/girl-in-spiders-web.jpg',
      ageBadge: '16+'
    },
    {
      id: 5,
      title: 'Avatar 5',
      genres: ['Khoa học viễn tưởng', 'Phiêu lưu'],
      country: 'Mỹ',
      year: 2028,
      posterUrl: 'assets/posters/avatar5.jpg',
      ageBadge: '13+'
    },
    // thêm 1 ít phim nữa cho có nhiều trang
    {
      id: 6,
      title: 'Đời Gió Hú',
      genres: ['Chính kịch', 'Lãng mạn'],
      country: 'Anh',
      year: 2023,
      posterUrl: 'assets/posters/doi-gio-hu.jpg'
    },
    {
      id: 7,
      title: 'Chàng Mèo Cô Đơn',
      genres: ['Hài', 'Hoạt hình'],
      country: 'Mỹ',
      year: 2026,
      posterUrl: '\assets\meocodon.jpg'
    },
    {
      id: 8,
      title: 'Cảm Ơn Người Đã Thức Cùng Tôi',
      genres: ['Tình cảm'],
      country: 'Hàn Quốc',
      year: 2024,
      posterUrl: 'assets/posters/cam-on-nguoi-da-thuc.jpg'
    },
    {
      id: 9,
      title: 'Báu Vật Trời Cho',
      genres: ['Tình cảm', 'Gia đình'],
      country: 'Việt Nam',
      year: 2025,
      posterUrl: 'assets/posters/bau-vat-troi-cho.jpg',
      ageBadge: '13+'
    },
    {
      id: 10,
      title: 'Tuyển Thủ Dê: Mùi Vị Chiến Thắng',
      genres: ['Hài', 'Hoạt hình'],
      country: 'Mỹ',
      year: 2025,
      posterUrl: 'assets/posters/goat.jpg'
    },
    // thêm vài phim để phân trang
    {
      id: 11,
      title: 'The Batman',
      genres: ['Hành động', 'Hình sự'],
      country: 'Mỹ',
      year: 2022,
      posterUrl: 'assets/posters/batman.jpg',
      ageBadge: '16+'
    },
    {
      id: 12,
      title: 'Conan: Tàu Ngầm Sắt',
      genres: ['Hoạt hình', 'Trinh thám'],
      country: 'Nhật Bản',
      year: 2023,
      posterUrl: 'assets/posters/conan-submarine.jpg'
    }
  ];

  // filter state
  genreFilter = 'all';
  countryFilter = 'all';
  yearFilter = 'all';
  searchTerm = '';

  // phân trang
  page = 1;
  pageSize = 10; // 10 phim / trang

  // option cho filter (có thể generate từ movies, mình hard-code cho dễ hiểu)
  genreOptions = [
    { value: 'all', label: 'Thể loại' },
    { value: 'Hành động', label: 'Hành động' },
    { value: 'Chính kịch', label: 'Chính kịch' },
    { value: 'Khoa học viễn tưởng', label: 'Khoa học viễn tưởng' },
    { value: 'Hài', label: 'Hài' },
    { value: 'Hoạt hình', label: 'Hoạt hình' },
    { value: 'Tình cảm', label: 'Tình cảm' }
  ];

  countryOptions = [
    { value: 'all', label: 'Quốc gia' },
    { value: 'Việt Nam', label: 'Việt Nam' },
    { value: 'Mỹ', label: 'Mỹ' },
    { value: 'Hàn Quốc', label: 'Hàn Quốc' },
    { value: 'Nhật Bản', label: 'Nhật Bản' },
    { value: 'Anh', label: 'Anh' }
  ];

  yearOptions = [
    { value: 'all', label: 'Năm' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2028', label: '2028' }
  ];

  // ====== logic filter + phân trang ======

  // danh sách sau khi áp filter
  get filteredMovies(): MovieItem[] {
    let result = [...this.movies];

    if (this.genreFilter !== 'all') {
      result = result.filter(m =>
        m.genres.some(g => g.toLowerCase().includes(this.genreFilter.toLowerCase()))
      );
    }

    if (this.countryFilter !== 'all') {
      result = result.filter(m => m.country === this.countryFilter);
    }

    if (this.yearFilter !== 'all') {
      const y = Number(this.yearFilter);
      result = result.filter(m => m.year === y);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(q));
    }

    return result;
  }

  // danh sách cho trang hiện tại
  get pagedMovies(): MovieItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredMovies.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMovies.length / this.pageSize) || 1);
  }

  get pages(): number[] {
    const total = this.totalPages;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  onFilterChange(): void {
    this.page = 1; // reset về trang 1 mỗi lần đổi filter / search
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  prevPage(): void {
    this.goToPage(this.page - 1);
  }

  nextPage(): void {
    this.goToPage(this.page + 1);
  }
}
