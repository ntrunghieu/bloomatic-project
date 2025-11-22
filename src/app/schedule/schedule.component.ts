import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CinemaHeroComponent } from '../cinema-hero/cinema-hero.component';
import { PaymentService } from '../core/services/payment/payment.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { ElementRef, ViewChild } from '@angular/core';

declare var paypal: any;
type City = 'Hồ Chí Minh' | 'Hà Nội' | 'Đà Nẵng';
type Brand = 'Bloomatic' | 'CGV' | 'Lotte' | 'BHD' | 'Khác';

type SeatType = 'normal' | 'vip';
type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  id: string;
  row: string;
  col: number;
  type: SeatType;
  status: SeatStatus;
}

type Cinema = {
  id: number;
  city: City;
  brand: Brand;
  name: string;
  logo?: string;
  address?: string;
};

type ShowtimeFormat = {
  name: string;
  // key = ngày (ISO: 2025-11-16), value = list giờ chiếu
  showtimesByDate: {
    [isoDate: string]: string[];
  };
};

type MovieSchedule = {
  id: number;
  title: string;
  poster: string;
  genres: string[];
  rating?: number;
  formats: ShowtimeFormat[];
};

interface CinemaSchedule {
  cinema: Cinema;
  movies: MovieSchedule[];
}

// View model dùng cho template (formats đã filter theo ngày => có times[])
type MovieView = {
  id: number;
  title: string;
  poster: string;
  genres: string[];
  rating?: number;
  formats: { name: string; times: string[] }[];
};

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, CinemaHeroComponent, QRCodeComponent],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
})
export class ScheduleComponent {
  // @ViewChild('paypalButtons', { static: false })
  // paypalButtons?: ElementRef<HTMLDivElement>;
  // paypalButtonsRendered = false;

  // ====== BỘ LỌC CHUNG ======
  selectedCity: City = 'Đà Nẵng';
  brandFilter: Brand | 'all' = 'all';
  searchTerm = '';

  // ====== NGÀY ======
  dates: { day: number; weekday: string; iso: string; isToday: boolean }[] = [];
  selectedIndex = 0;

  // ====== DỮ LIỆU LỊCH CHIẾU ======
  private allSchedules: CinemaSchedule[] = [];

  // rạp đang chọn (theo id)
  selectedCinemaId: number | null = null;

  // hiển thị sidebar rạp
  cinemaLimit = 6;
  showAllCinemas = false;

  // Modal chọn ghế
  seatModalOpen = false;
  confirmModalOpen = false;

  // thêm property
  paypalQrOpen = false;
  paypalApproveUrl = '';
  @ViewChild('paypalButtons', { static: false })
  paypalButtons?: ElementRef<HTMLDivElement>;
  paypalButtonsRendered = false;



  selectedShowtime: {
    cinemaName: string;
    movieTitle: string;
    formatName: string;
    time: string;
  } | null = null;

  // ma trận ghế
  seats: Seat[][] = [];

  constructor(private paymentService: PaymentService) {
    // 7 ngày tiếp theo
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

    const d0 = this.dates[0]?.iso;
    const d1 = this.dates[1]?.iso;
    const d2 = this.dates[2]?.iso;

    // ====== MOVIE DEMO (sau này map từ API) ======
    const movieA: MovieSchedule = {
      id: 201,
      title: 'Quái Thú Vô Hình: Vùng Đất Chết Chóc',
      poster:
        'https://www.themoviedb.org/t/p/original/sx5EuckP7SBQrlMlxg0PLt282WS.jpg',
      genres: ['Khoa Học Viễn Tưởng', 'Hành Động'],
      rating: 7.9,
      formats: [
        {
          name: '2D Phụ đề',
          showtimesByDate: {
            [d0!]: ['20:00', '21:30', '22:20'],
            [d1!]: ['18:00', '19:45'],
          },
        },
      ],
    };

    const movieB: MovieSchedule = {
      id: 202,
      title: 'Chuyện Xóm Tui',
      poster:
        'https://nld.mediacdn.vn/291774122806476800/2023/1/19/first-look-poster-16741359844677620107.jpg',
      genres: ['Tâm Lý', 'Kịch'],
      rating: 8.1,
      formats: [
        {
          name: '2D',
          showtimesByDate: {
            [d0!]: ['18:00', '20:45'],
            [d2!]: ['17:15'],
          },
        },
      ],
    };

    const movieC: MovieSchedule = {
      id: 203,
      title: 'Phi Vụ Động Trời 2',
      poster:
        'https://www.cgv.vn/media/catalog/product/cache/2/image/1800x/602f0fa2c1f0d1ba5e241f914e856ff9/p/o/poster_flying_ea.jpg',
      genres: ['Hài', 'Hoạt Hình'],
      rating: 8.9,
      formats: [
        {
          name: '2D Lồng tiếng',
          showtimesByDate: {
            [d1!]: ['10:00', '14:00'],
          },
        },
      ],
    };

    // ====== TẤT CẢ RẠP + LỊCH CHIẾU ======
    this.allSchedules = [
      {
        cinema: {
          id: 1,
          name: 'Bloomatic Hùng Vương',
          city: 'Đà Nẵng',
          brand: 'Bloomatic',
          address: 'Tầng 7 | 126 Hùng Vương, Hải Châu, Tp. Đà Nẵng',
        },
        movies: [movieA, movieB],
      },
      {
        cinema: {
          id: 2,
          name: 'Bloomatic Điện Biên Phủ',
          city: 'Đà Nẵng',
          brand: 'Bloomatic',
          address: 'Tầng 3 | 110 Điện Biên Phủ, Hải Châu, Tp. Đà Nẵng',
        },
        movies: [movieA, movieC],
      },
      {
        cinema: {
          id: 3,
          name: 'CGV Vincom Đà Nẵng',
          city: 'Đà Nẵng',
          brand: 'CGV',
          address: 'Tầng 5 | 910A Ngô Quyền, Sơn Trà, Tp. Đà Nẵng',
        },
        movies: [movieA],
      },
      {
        cinema: {
          id: 4,
          name: 'Bloomatic Landmark 81',
          city: 'Hồ Chí Minh',
          brand: 'Bloomatic',
          address: 'Tầng 5 | 208 Nguyễn Hữu Cảnh, Bình Thạnh, Tp. HCM',
        },
        movies: [movieB],
      },
    ];

    this.ensureSelectedCinema();
  }

  // ====== GETTER PHỤ THUỘC BỘ LỌC ======

  get selectedDateIso(): string | null {
    return this.dates[this.selectedIndex]?.iso ?? null;
  }

  get selectedDateLabel(): string {
    const d: any = this.dates?.[this.selectedIndex];
    if (!d) return '';

    // nếu trước đó bạn có field iso: '2025-05-15'
    if (d.iso) {
      const [y, m, day] = d.iso.split('-');
      return `${day}/${m}/${y}`;
    }

    // fallback: ghép day + weekday
    return `${d.day} ${d.weekday}`;
  }

  openConfirmModal() {
    if (!this.selectedShowtime) {
      return;
    }
    if (!this.selectedSeats.length) {
      alert('Bạn chưa chọn ghế nào.');
      return;
    }
    this.confirmModalOpen = true;
  }

  closeConfirmModal() {
    this.confirmModalOpen = false;
  }

  /** Render 2 nút PayPal (PayPal + thẻ ghi nợ/tín dụng) trong modal */
  private renderPaypalButtons(): void {
    if (!this.paypalButtons) return;

    // tránh render lặp lại
    if (this.paypalButtonsRendered) return;

    const host = this.paypalButtons.nativeElement;
    host.innerHTML = '';

    // demo: quy đổi VNĐ -> USD cho dễ
    const amountUsd = +(this.totalPrice / 23000).toFixed(2);

    try {
      paypal.Buttons({
        style: {
          layout: 'vertical', // sẽ ra 2 nút: PayPal (vàng) + thẻ (đen)
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amountUsd.toString(),
                  currency_code: 'USD',
                },
                description: `Vé xem phim - ${this.selectedSeats
                  .map((s) => s.id)
                  .join(', ')}`,
              },
            ],
          });
        },
        onApprove: (_data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            console.log('Thanh toán PayPal DEMO thành công:', details);
            alert('Thanh toán PayPal demo thành công!');
          });
        },
        onError: (err: any) => {
          console.error('Lỗi PayPal:', err);
          alert('Có lỗi khi mở PayPal, vui lòng thử lại.');
        },
      }).render(host);

      this.paypalButtonsRendered = true;
    } catch (err) {
      console.error('Không thể render PayPal Buttons. SDK đã được load chưa?', err);
    }
  }


  proceedPayment() {
    // Sau này bạn điều hướng sang trang thanh toán / gọi API ở đây
    console.log('Tiến hành thanh toán', {
      showtime: this.selectedShowtime,
      seats: this.selectedSeats,
      amount: this.totalPrice
    });

    if (!this.selectedShowtime || !this.selectedSeats.length) {
      alert('Thiếu thông tin showtime hoặc ghế.');
      return;
    }

    const payload = {
      showtimeId: 1, /* id xuất chiếu */
      seatCodes: this.selectedSeats.map(s => s.id),
      amount: this.totalPrice
    };

    this.paymentService.createPaypalOrder(payload).subscribe({
      next: (res) => {
        this.paypalApproveUrl = res.approveUrl;
        this.paypalQrOpen = true;
        setTimeout(() => this.renderPaypalButtons(), 0);
      },
      error: (err) => {
        console.error(err);
        alert('Tạo đơn PayPal thất bại');
      }
    });

    // demo: đóng cả 2 modal
    this.confirmModalOpen = true;
    this.seatModalOpen = true;
  }

  openPaypalInBrowser() {
    if (this.paypalApproveUrl) {
      window.open(this.paypalApproveUrl, '_blank');
    }
  }



  // Rạp sau khi lọc theo city + brand + search
  get filteredCinemaSchedules(): CinemaSchedule[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.allSchedules.filter((cs) => {
      const matchesCity = cs.cinema.city === this.selectedCity;
      const matchesBrand =
        this.brandFilter === 'all' || cs.cinema.brand === this.brandFilter;
      const matchesSearch =
        !term || cs.cinema.name.toLowerCase().includes(term);

      return matchesCity && matchesBrand && matchesSearch;
    });
  }

  // Rạp hiển thị trong sidebar (có giới hạn + Xem thêm)
  get visibleCinemas(): Cinema[] {
    const list = this.filteredCinemaSchedules.map((cs) => cs.cinema);
    if (this.showAllCinemas || list.length <= this.cinemaLimit) {
      return list;
    }
    return list.slice(0, this.cinemaLimit);
  }

  get canShowMore(): boolean {
    return this.filteredCinemaSchedules.length > this.cinemaLimit;
  }

  get activeCinemaSchedule(): CinemaSchedule | null {
    if (this.selectedCinemaId == null) return null;
    return (
      this.allSchedules.find(
        (cs) => cs.cinema.id === this.selectedCinemaId
      ) ?? null
    );
  }

  // Movies hiển thị đúng rạp + đúng ngày
  get filteredMovies(): MovieView[] {
    const schedule = this.activeCinemaSchedule;
    const date = this.selectedDateIso;
    if (!schedule || !date) return [];

    return schedule.movies
      .map<MovieView>((movie) => {
        const formats = movie.formats
          .map((fmt) => ({
            name: fmt.name,
            times: fmt.showtimesByDate[date] ?? [],
          }))
          .filter((f) => f.times.length > 0);

        return {
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          genres: movie.genres,
          rating: movie.rating,
          formats,
        };
      })
      .filter((m) => m.formats.length > 0);
  }

  // ====== ACTIONS ======

  onFilterChange(): void {
    this.showAllCinemas = false;
    this.ensureSelectedCinema();
  }

  setBrandFilter(brand: Brand | 'all'): void {
    this.brandFilter = brand;
    this.onFilterChange();
  }

  selectCinema(cinemaId: number): void {
    this.selectedCinemaId = cinemaId;
  }

  toggleShowMore(): void {
    this.showAllCinemas = !this.showAllCinemas;
  }

  // ====== UTILS ======

  private ensureSelectedCinema(): void {
    const list = this.filteredCinemaSchedules;
    if (!list.length) {
      this.selectedCinemaId = null;
      return;
    }

    if (
      this.selectedCinemaId == null ||
      !list.some((cs) => cs.cinema.id === this.selectedCinemaId)
    ) {
      this.selectedCinemaId = list[0].cinema.id;
    }
  }

  // ghế đang chọn + tính tiền demo
  get selectedSeats(): Seat[] {
    return this.seats.flat().filter(s => s.status === 'selected');
  }

  get totalPrice(): number {
    const base = 90000; // ghế thường 90k, VIP 135k
    return this.selectedSeats.reduce(
      (sum, seat) => sum + (seat.type === 'vip' ? base * 1.5 : base),
      0
    );
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + 'đ';
  }
  // mở modal khi click giờ chiếu
  openSeatModal(movie: MovieView, formatName: string, time: string) {
    const cinemaName = this.activeCinemaSchedule?.cinema.name ?? '';

    this.selectedShowtime = {
      cinemaName,
      movieTitle: movie.title,
      formatName,
      time,
    };

    this.buildSeatLayout();
    this.seatModalOpen = true;
  }

  closeSeatModal() {
    this.seatModalOpen = false;
    this.selectedShowtime = null;
  }

  // tạo layout ghế demo (7 hàng thường trên, 7 hàng VIP dưới)
  buildSeatLayout() {
    const rowsTop = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];      // ghế thường
    const rowsBottom = ['H', 'I', 'J', 'K', 'L', 'M', 'N'];   // ghế VIP
    const cols = 16;
    const seats: Seat[][] = [];

    rowsTop.forEach(row => {
      const rowSeats: Seat[] = [];
      for (let col = 1; col <= cols; col++) {
        const id = `${row}${col}`;
        const status: SeatStatus = Math.random() < 0.1 ? 'booked' : 'available';
        rowSeats.push({ id, row, col, type: 'normal', status });
      }
      seats.push(rowSeats);
    });

    rowsBottom.forEach(row => {
      const rowSeats: Seat[] = [];
      for (let col = 1; col <= cols; col++) {
        const id = `${row}${col}`;
        const status: SeatStatus = Math.random() < 0.15 ? 'booked' : 'available';
        rowSeats.push({ id, row, col, type: 'vip', status });
      }
      seats.push(rowSeats);
    });

    this.seats = seats;
  }

  // click chọn / bỏ chọn ghế
  toggleSeat(seat: Seat) {
    if (seat.status === 'booked') return;
    seat.status = seat.status === 'selected' ? 'available' : 'selected';
  }

}
