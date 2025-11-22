import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type SimpleMovie = {
  title: string;
  poster: string;
  age?: string;
  release?: string;
  genres?: string[];
  description?: string;
  trailerId?: string;
};

interface Cinema {
  id: number;
  city: string;          // Đà Nẵng / Hà Nội / HCM
  name: string;
  address: string;
  mapUrl?: string;
  logoUrl: string;
  formatLabel: string;   // "2D Phụ đề" ...
  showtimesByDate: {     // key = ISO date, value = list suất chiếu
    [isoDate: string]: string[];  // ["16:30 ~ 18:13", ...]
  };
  isExpanded: boolean;
}

interface NowPlayingItem {
  id: number;
  movie: SimpleMovie;
  rating: number;
  ageClass: 'yellow' | 'orange' | 'green' | 'blue';
  badge?: string;
  cinemas: Cinema[];
}

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent {
  // ====== ngày ======
  dates: {
    day: number;
    weekday: string;
    iso: string;
    isToday: boolean;
  }[] = [];

  selectedIndex = 0;             // index tab ngày
  selectedCity = 'Đà Nẵng';      // thành phố đang chọn

  // rạp + suất chiếu của PHIM ĐANG XEM
  cinemas: Cinema[] = [];

  // danh sách phim đang chiếu (sidebar)
  nowPlaying: NowPlayingItem[] = [];
  activeNowPlayingId: number | null = null;

  // phim hiển thị ở phần detail chính
  @Input() movie: SimpleMovie = {
    title: 'G-DRAGON IN CINEMA [Übermensch]',
    poster:
      'https://www.cinema.com.my/images/movies/2025/7gdragonincinemaubermensch00_450.jpg',
    age: '13+',
    release: '11/11/2025',
    genres: ['Âm Nhạc', 'Tài liệu'],
    description:
      'G-DRAGON trở lại sau 8 năm với world tour [Übermensch], mở màn tại Goyang, Hàn Quốc. Bộ phim concert sẽ có nhiều phần biểu diễn mãn nhãn cùng hậu trường và lời kể gần gũi.',
    trailerId: 'dQw4w9WgXcQ'
  };

  constructor() {
    // ===== tạo 7 ngày liên tiếp =====
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const iso = d.toISOString().slice(0, 10);
      const day = d.getDate();
      const weekdayShort = d.toLocaleDateString('vi-VN', { weekday: 'short' });

      const isToday = i === 0;
      const weekday = isToday ? 'Hôm nay' : weekdayShort;

      this.dates.push({ day, weekday, iso, isToday });
    }

    const d0 = this.dates[0]?.iso; // hôm nay
    const d1 = this.dates[1]?.iso; // ngày mai
    const d2 = this.dates[2]?.iso; // ...

    // ===== demo CINEMA cho từng phim =====
    const cinemasGDragon: Cinema[] = [
      {
        id: 1,
        city: 'Đà Nẵng',
        name: 'CGV Vincom Đà Nẵng',
        address:
          'Tầng 4, TTTM Vincom Đà Nẵng, đường Ngô Quyền, P.An Hải Bắc, Q.Sơn Trà, TP. Đà Nẵng',
        mapUrl: '#',
        logoUrl: 'assets/logomini.jpeg',
        formatLabel: '2D Phụ đề',
        showtimesByDate: {
          [d0!]: [
            '16:30 ~ 18:13',
            '17:20 ~ 19:03',
            '18:40 ~ 20:23',
            '20:00 ~ 21:43'
          ],
          [d1!]: ['15:00 ~ 16:43', '19:00 ~ 20:43'],
          [d2!]: ['14:30 ~ 16:13']
        },
        isExpanded: true
      },
      {
        id: 2,
        city: 'Đà Nẵng',
        name: 'CGV Vĩnh Trung Plaza',
        address: '255-257 đường Hùng Vương, quận Thanh Khê, TP. Đà Nẵng',
        mapUrl: '#',
        logoUrl: 'assets/logomini.jpeg',
        formatLabel: '2D Phụ đề',
        showtimesByDate: {
          [d0!]: ['13:30 ~ 15:13', '18:10 ~ 19:53'],
          [d1!]: ['10:00 ~ 11:43']
        },
        isExpanded: false
      }
    ];

    const cinemasAnhTrai: Cinema[] = [
      {
        id: 3,
        city: 'Đà Nẵng',
        name: 'CGV Vincom Đà Nẵng',
        address:
          'Tầng 4, TTTM Vincom Đà Nẵng, đường Ngô Quyền, P.An Hải Bắc, Q.Sơn Trà, TP. Đà Nẵng',
        mapUrl: '#',
        logoUrl: 'assets/logomini.jpeg',
        formatLabel: '2D Lồng tiếng',
        showtimesByDate: {
          [d0!]: ['09:30 ~ 11:20', '21:00 ~ 22:50'],
          [d1!]: ['18:30 ~ 20:20']
        },
        isExpanded: true
      }
    ];

    const cinemasPhiVu: Cinema[] = [
      {
        id: 4,
        city: 'Đà Nẵng',
        name: 'CGV Vĩnh Trung Plaza',
        address: '255-257 đường Hùng Vương, quận Thanh Khê, TP. Đà Nẵng',
        mapUrl: '#',
        logoUrl: 'assets/logomini.jpeg',
        formatLabel: '3D Phụ đề',
        showtimesByDate: {
          [d1!]: ['14:00 ~ 16:00', '20:00 ~ 22:00']
        },
        isExpanded: true
      }
    ];

    const cinemasWicked: Cinema[] = [
      {
        id: 5,
        city: 'Đà Nẵng',
        name: 'CGV Vincom Đà Nẵng',
        address:
          'Tầng 4, TTTM Vincom Đà Nẵng, đường Ngô Quyền, P.An Hải Bắc, Q.Sơn Trà, TP. Đà Nẵng',
        mapUrl: '#',
        logoUrl: 'assets/logomini.jpeg',
        formatLabel: '2D Phụ đề',
        showtimesByDate: {
          [d2!]: ['19:00 ~ 21:30']
        },
        isExpanded: true
      }
    ];

    // mặc định đang xem G-DRAGON
    this.cinemas = cinemasGDragon;

    // ===== danh sách phim đang chiếu (sau này bạn gắn API vào đây) =====
    this.nowPlaying = [
      {
        id: 1,
        movie: this.movie,
        rating: 9.8,
        ageClass: 'yellow',
        cinemas: cinemasGDragon
      },
      {
        id: 2,
        movie: {
          title: 'Anh Trai Say Xe',
          poster: 'assets/posters/anh-trai-say-xe.jpg',
          age: '16+',
          release: '12/12/2025',
          genres: ['Đẹp trai', 'Hài']
        },
        rating: 9.5,
        ageClass: 'orange',
        badge: 'Sneakshow',
        cinemas: cinemasAnhTrai
      },
      {
        id: 3,
        movie: {
          title: 'Phi Vụ Động Trời 2',
          poster: 'assets/posters/phi-vu-dong-troi-2.jpg',
          age: 'P',
          genres: ['Hài', 'Hoạt hình']
        },
        rating: 10,
        ageClass: 'green',
        badge: 'Sneakshow',
        cinemas: cinemasPhiVu
      },
      {
        id: 4,
        movie: {
          title: 'Wicked: Phần 2',
          poster: 'assets/posters/wicked-2.jpg',
          age: 'K',
          genres: ['Giả tưởng', 'Phiêu lưu']
        },
        rating: 8.9,
        ageClass: 'blue',
        badge: 'Sneakshow',
        cinemas: cinemasWicked
      }
    ];

    this.activeNowPlayingId = 1;
  }

  // ====== filter theo city + ngày ======

  get selectedDateIso(): string | null {
    return this.dates[this.selectedIndex]?.iso ?? null;
  }

  // chỉ lấy rạp đúng city + có suất chiếu cho ngày đang chọn
  get filteredCinemas(): Cinema[] {
    const date = this.selectedDateIso;
    if (!date) return [];

    return this.cinemas.filter(
      c => c.city === this.selectedCity && !!c.showtimesByDate[date]?.length
    );
  }

  onFilterChange(): void {
    const list = this.filteredCinemas;
    this.cinemas.forEach(c => (c.isExpanded = false));
    if (list.length > 0) {
      list[0].isExpanded = true;
    }
  }

  // list suất chiếu cho 1 rạp theo ngày đang chọn
  getShowtimesForCinema(c: Cinema): string[] {
    const date = this.selectedDateIso;
    if (!date) return [];
    return c.showtimesByDate[date] || [];
  }

  // ====== chọn phim ở sidebar ======
  selectNowPlaying(item: NowPlayingItem) {
    this.movie = item.movie;      // cập nhật thông tin phim chính
    this.cinemas = item.cinemas;  // cập nhật rạp + suất chiếu cho phim đó
    this.activeNowPlayingId = item.id;
    this.onFilterChange();        // reset expand theo city + ngày
    this.showMore = false;        // thu gọn mô tả nếu đang mở
  }

  // ====== trailer & read-more ======
  openTrailer(id?: string) {
    if (!id) return;
    const url = `https://www.youtube.com/watch?v=${id}`;
    window.open(url, '_blank');
  }

  showMore = false;
  toggleShowMore() {
    this.showMore = !this.showMore;
  }
  get isLong() {
    return (this.movie?.description || '').length > 200;
  }

  // toggle rạp theo id
  toggleCinema(id: number) {
    const cinema = this.cinemas.find(c => c.id === id);
    if (cinema) {
      cinema.isExpanded = !cinema.isExpanded;
    }
  }
}
