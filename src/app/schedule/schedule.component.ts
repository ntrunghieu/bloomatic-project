import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CinemaHeroComponent } from '../cinema-hero/cinema-hero.component';
import { PaymentService } from '../core/services/payment/payment.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { ElementRef, ViewChild } from '@angular/core';
import { ScheduleService, SeatLayoutDto } from '../services/schedule/schedule.service';
import { environment } from '../../environments/environment.prod';

type Brand = 'Bloomatic' | 'CGV' | 'Lotte' | 'BHD';

interface SeatStatusEvent {
  lichChieuId: number;
  gheId: number;
  nhanGhe: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED';
}

export interface PhimLichChieuDto {
  id: number;
  tenPhim: string;
  posterUrl: string;
  gioiHanTuoi: string;
  theLoai: string; // Chuỗi thể loại đã nối
}

export interface LichChieuUserDto {
  maLichChieu: number;
  maPhong: number;
  ngayChieu: string;
  gioBatDau: string;
  gioKetThuc: string; // Thêm trường này
  giaCoSo: number;
  dinhDang: string;
  hinhThucDich: string;
  phim: PhimLichChieuDto;
}

export interface RapLichChieuDto { // Đổi tên RapLichChieu thành RapLichChieuDto
  rapId: number; // Lấy ID trực tiếp
  tenRap: string;
  diaChi: string;
  lichChieu: LichChieuUserDto[],
  // thanhPho: City;
}

export interface Phim {
  id: number;
  tenPhim: string;
  posterUrl: string;
  trailerUrl: string;
  moTa: string;
  gioiHanTuoi: string;
  theLoai: string; // Đảm bảo có theLoai: string
}

export interface Rap {
  id: number;
  tenRap: string; // Dùng thay cho name
  diaChi: string; // Dùng thay cho address
}


export type MovieViewReal = {
  maPhim: number;
  tenPhim: string;
  poster: string;
  genres: string[]; // Giữ lại để HTML không lỗi, nhưng cần phải lấy từ BE
  ageTag: string;
  formats: {
    name: string; // Kết hợp DinhDang + HinhThucDich
    times: { time: string; endTime: string; lichChieuId: number; giaCoSo: number; }[];
  }[];
};

declare var paypal: any;
type City = 'Hồ Chí Minh' | 'Hà Nội' | 'Đà Nẵng';

type SeatType = 'normal' | 'vip';
type SeatStatus = 'available' | 'selected' | 'booked';
type BrandFilter = Brand | 'all'; // ĐỊNH NGHĨA BrandFilter

interface Seat {
  seatId: number;
  code: string;
  row: string;
  col: number;
  type: SeatType;
  status: SeatStatus;
  heSoGia: number;
}

type Cinema = {
  id: number;
  city: City;
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
export class ScheduleComponent implements OnInit {
  // @ViewChild('paypalButtons', { static: false })
  // paypalButtons?: ElementRef<HTMLDivElement>;
  // paypalButtonsRendered = false;

  api: string | undefined;
  // ====== BỘ LỌC CHUNG ======
  selectedCity: City = 'Đà Nẵng';
  // brandFilter: Brand | 'all' = 'all';
  searchTerm = '';

  // ====== NGÀY ======
  dates: { day: number; weekday: string; iso: string; isToday: boolean }[] = [];
  selectedIndex = 0;

  // ====== DỮ LIỆU LỊCH CHIẾU ======
  // private allSchedules: CinemaSchedule[] = [];

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
  paypalApproveUrl: string | null = null;
  @ViewChild('paypalButtons', { static: false })
  paypalButtons?: ElementRef<HTMLDivElement>;
  paypalButtonsRendered = false;

  selectedShowtime: {
    cinemaName: string;
    movieTitle: string;
    formatName: string;
    time: string;
    lichChieuId: number;
    giaCoSo: number;
  } | null = null;

  // ma trận ghế
  seats: Seat[][] = [];

  // ====== GIỮ GHẾ: ĐỒNG HỒ ĐẾM NGƯỢC ======
  holdDurationSeconds = 180;          // thời gian giữ ghế (3 phút) – nhớ sync với TTL bên BE
  holdRemainingSeconds = 0;           // còn lại bao nhiêu giây
  private holdTimerId: any = null;    // id của setInterval
  private allSchedules: RapLichChieuDto[] = [];
  private seatEventSource?: EventSource;

  constructor(private paymentService: PaymentService, private scheduleService: ScheduleService) {
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


    this.ensureSelectedCinema();
  }

  ngOnInit(): void {
    // Thay thế logic mock data trong constructor bằng gọi API
    this.loadSchedules();
    console.log('Lịch chiếu đã tải:', this.allSchedules);

  }

  // Hàm mới: Tải lịch chiếu từ Service
  loadSchedules(): void {
    // Sử dụng selectedCity và ngày đầu tiên (startDate)
    const startDate = this.dates[0].iso;

    this.scheduleService.getSchedules(
      this.selectedCity,
      startDate
    ).subscribe({
      next: (data) => {
        this.allSchedules = data;
        this.ensureSelectedCinema();
      },
      error: (err) => console.error('Lỗi khi tải lịch chiếu:', err)
    });
  }


  // thêm interface cho rõ luôn (đặt trên cùng file, gần chỗ interface Seat)
  loadSeatLayout(lichChieuId: number) {
    this.seats = [];

    this.scheduleService.getSeatLayout(lichChieuId).subscribe({
      next: (layout: SeatLayoutDto) => {
        console.log('Seat layout response:', layout);

        // ĐỔI gheDTO → gheUserDto
        if (!layout || !Array.isArray(layout.gheUserDto)) {
          console.error('Seat layout không hợp lệ, thiếu gheUserDto:', layout);
          this.seats = [];
          return;
        }

        const seats: Seat[][] = [];

        const totalRows = layout.hang;
        const totalCols = layout.cot;

        // Khởi tạo ma trận rỗng
        for (let r = 0; r < totalRows; r++) {
          seats[r] = new Array<Seat>(totalCols);
        }

        layout.gheUserDto.forEach(g => {
          const rowIndex = g.hang;      // đã 0-based
          const colIndex = g.cot - 1;   // BE trả 1-based → trừ 1

          const rowLabel = String.fromCharCode('A'.charCodeAt(0) + rowIndex);

          const seat: Seat = {
            seatId: g.id,
            code: g.nhanGhe,
            row: rowLabel,
            col: colIndex + 1, // hiển thị 1..N
            type:
              g.loaiGhe === 'VIP' || g.loaiGhe === 'COUPLE'
                ? 'vip'
                : 'normal',
            status: g.trangThai === 'BOOKED' ? 'booked' : 'available',
            heSoGia: g.heSoGia ?? 1,
          };

          seats[rowIndex][colIndex] = seat;
        });

        this.seats = seats;
      },
      error: (err) => {
        console.error('Lỗi tải layout ghế:', err);
      }
    });
  }



  onFilterChange(): void {
    this.showAllCinemas = false;
    this.loadSchedules();
  }

  private getBrandFromRapName(name: string): BrandFilter {
    if (name.includes('CGV')) return 'CGV';
    if (name.includes('Lotte')) return 'Lotte';
    if (name.includes('Bloomatic')) return 'Bloomatic';
    if (name.includes('BHD')) return 'BHD';
    return 'all'; // Nếu không thuộc brand nào, giữ lại
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
    // this.clearHoldTimer();
  }

  /** Render 2 nút PayPal (PayPal + thẻ ghi nợ/tín dụng) trong modal */
  private renderPaypalButtons(): void {

    if (!this.paypalButtons) return;
    if (this.paypalButtonsRendered) return;

    const host = this.paypalButtons.nativeElement;
    host.innerHTML = '';


    // const amountUsd = +(this.totalPrice / 26000).toFixed(2);

    const orderId = (this as any).currentPaypalOrderId;
    const thanhToanId = (this as any).currentThanhToanId;

    if (!orderId || !thanhToanId) {
      console.error('Chưa có orderId hoặc thanhToanId từ BE');
      return;
    }

    try {
      paypal.Buttons({
        style: {
          layout: 'vertical', // sẽ ra 2 nút: PayPal (vàng) + thẻ (đen)
        },
        // createOrder: (_data: any, actions: any) => {
        //   return actions.order.create({
        //     purchase_units: [
        //       {
        //         amount: {
        //           value: amountUsd.toString(),
        //           currency_code: 'USD',
        //         },
        //         description: `Vé xem phim - ${this.selectedSeats
        //           .map((s) => s.code)
        //           .join(', ')}`,
        //       },
        //     ],
        //   });
        // },
        createOrder: () => {
          return orderId;
        },
        onApprove: (_data: any, _actions: any) => {
          // FE không capture trực tiếp, mà gọi BE capture
          this.paymentService.capturePaypalOrder(orderId, thanhToanId).subscribe({
            next: () => {
              alert('Thanh toán thành công! Vé của bạn đã được xác nhận.');

              // TODO: có thể chuyển sang trang lịch sử vé, hoặc reload
              this.paypalQrOpen = false;
              this.confirmModalOpen = false;
              this.seatModalOpen = false;
            },
            error: (err) => {
              console.error('Capture PayPal thất bại:', err);
              alert('Có lỗi khi xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
            }
          });
        },
        // onApprove: (_data: any, actions: any) => {
        //   return actions.order.capture().then((details: any) => {
        //     console.log('Thanh toán PayPal DEMO thành công:', details);
        //     alert('Thanh toán PayPal demo thành công!');
        //   });
        // },
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
      showtimeId: this.selectedShowtime!.lichChieuId,
      seatCodes: this.selectedSeats.map(s => s.code),
      amount: this.totalPrice
    });

    if (!this.selectedShowtime || !this.selectedSeats.length) {
      alert('Thiếu thông tin suất chiếu hoặc ghế.');
      return;
    }

    // const payload = {
    //   showtimeId: 1, /* id xuất chiếu */
    //   seatCodes: this.selectedSeats.map(s => s.code),
    //   amount: this.totalPrice
    // };

    const payload = {
      lichChieuId: this.selectedShowtime.lichChieuId,
      seatIds: this.selectedSeats.map(s => s.seatId),
      seatCodes: this.selectedSeats.map(s => s.code),
      clientAmount: this.totalPrice
    };

    this.paymentService.createPaypalOrder(payload).subscribe({
      next: (res) => {
        this.paypalApproveUrl = res.approveUrl;
        this.paypalQrOpen = true;

        // Lưu lại để dùng lúc capture
        (this as any).currentPaypalOrderId = res.orderId;
        (this as any).currentThanhToanId = res.thanhToanId;

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


  get filteredCinemaSchedules(): RapLichChieuDto[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.allSchedules.filter((cs) => {
      // Chỉ lọc theo Search Term (tên rạp)
      const matchesSearch =
        !term || cs.tenRap.toLowerCase().includes(term); // SỬA: Dùng cs.tenRap

      return matchesSearch;
    });
  }

  // Rạp hiển thị trong sidebar (có giới hạn + Xem thêm)
  get visibleCinemas(): RapLichChieuDto[] {
    const list = this.filteredCinemaSchedules; // list là RapLichChieu[]
    if (this.showAllCinemas || list.length <= this.cinemaLimit) {
      return list;
    }
    return list.slice(0, this.cinemaLimit);
  }

  get canShowMore(): boolean {
    return this.filteredCinemaSchedules.length > this.cinemaLimit;
  }


  get activeCinemaSchedule(): RapLichChieuDto | null {
    if (this.selectedCinemaId == null) return null;
    return (
      this.allSchedules.find(
        (cs) => cs.rapId === this.selectedCinemaId // SỬA: Dùng cs.rapId
      ) ?? null
    );
  }

  get filteredMovies(): MovieViewReal[] {
    const schedule = this.activeCinemaSchedule; // RapSchedule | null
    const date = this.selectedDateIso; // ISO string: 'YYYY-MM-DD'

    if (!schedule || !date) return [];

    // 1. Lọc các suất chiếu (LichChieu) cho ngày đang chọn
    const dailyShowtimes = schedule.lichChieu.filter(lc => {
      // Dùng lc.ngayBatDau (LocalDate string) để so sánh với ngày ISO đã chọn
      return lc.ngayChieu === date;
    });

    // 2. Nhóm suất chiếu theo Phim (maPhim)
    const moviesMap = new Map<number, LichChieuUserDto[]>();
    dailyShowtimes.forEach(lc => {
      const maPhim = lc.phim.id; // Dùng id của Phim
      if (!moviesMap.has(maPhim)) {
        moviesMap.set(maPhim, []);
      }
      moviesMap.get(maPhim)!.push(lc);
    });

    // 3. Chuyển đổi Map thành MovieViewReal[]
    const movieViews: MovieViewReal[] = [];
    moviesMap.forEach((showtimes, maPhim) => {
      if (showtimes.length === 0) return;

      const firstShowtime = showtimes[0];
      const phimInfo = firstShowtime.phim;

      // 3a. Nhóm theo Định dạng (dinhDang + hinhThucDich)
      const formatsMap = new Map<string, LichChieuUserDto[]>();
      showtimes.forEach(lc => {
        // Kết hợp DinhDang (2D/3D) và HinhThucDich (Phụ đề/Lồng tiếng) thành tên format
        const formatKey = `${lc.dinhDang} ${lc.hinhThucDich}`;
        if (!formatsMap.has(formatKey)) {
          formatsMap.set(formatKey, []);
        }
        formatsMap.get(formatKey)!.push(lc);
      });

      const formatsView = Array.from(formatsMap.entries()).map(([name, list]) => ({
        name: name.trim(),
        times: list
          .map(lc => ({
            time: lc.gioBatDau.substring(0, 5),
            endTime: lc.gioKetThuc ? lc.gioKetThuc.substring(0, 5) : '',
            lichChieuId: lc.maLichChieu, // Dùng id suất chiếu
            giaCoSo: lc.giaCoSo,
          }))
          .sort((a, b) => (a.time > b.time ? 1 : -1)),
      }));

      // 3b. Tạo MovieViewReal
      movieViews.push({
        maPhim: maPhim,
        tenPhim: phimInfo.tenPhim,
        poster: phimInfo.posterUrl, // Dùng posterUrl
        ageTag: phimInfo.gioiHanTuoi, // Dùng gioiHanTuoi
        genres: (phimInfo as any).theLoai ? (phimInfo as any).theLoai.split(',').map((g: string) => g.trim()) : ['Khác'],
        formats: formatsView.filter(f => f.times.length > 0)
      });
    });

    return movieViews;
  }


  // ====== ACTIONS ======



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
      !list.some((cs) => cs.rapId === this.selectedCinemaId) // SỬA: Dùng cs.rapId
    ) {
      this.selectedCinemaId = list[0].rapId; // SỬA: Dùng list[0].rapId
    }
  }

  // ghế đang chọn + tính tiền demo
  get selectedSeats(): Seat[] {
    // return this.seats.flat().filter(s => s.status === 'selected');
    return this.seats.flat().filter(s => s.status === 'selected');

  }

  get totalPrice(): number {
    if (!this.selectedShowtime) return 0;

    const base = this.selectedShowtime.giaCoSo; // giá cơ sở từ lịch chiếu

    return this.selectedSeats.reduce(
      (sum, seat) => sum + base * seat.heSoGia,
      0
    );
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + 'đ';
  }

  openSeatModal(movie: MovieViewReal, formatName: string, showtime: { time: string; endTime: string; lichChieuId: number; giaCoSo: number }) {
    const cinemaName = this.activeCinemaSchedule?.tenRap ?? ''; // Dùng rap.tenRap

    // Cần thêm lichChieuId vào selectedShowtime
    this.selectedShowtime = {
      cinemaName,
      movieTitle: movie.tenPhim,
      formatName,
      // Lưu thời gian hiển thị dạng "HH:mm - HH:mm"
      time: showtime.endTime ? `${showtime.time} - ${showtime.endTime}` : showtime.time,
      lichChieuId: showtime.lichChieuId,
      giaCoSo: showtime.giaCoSo,
    } as any;

    this.loadSeatLayout(showtime.lichChieuId);
    this.connectSeatStream(showtime.lichChieuId);
    // this.buildSeatLayout();
    this.seatModalOpen = true;
  }


  private connectSeatStream(lichChieuId: number) {
    if (this.seatEventSource) {
      this.seatEventSource.close();
    }

    this.api = environment.apiBase;
    const url = `${this.api}/public/suat-chieu/${lichChieuId}/ghe/stream`;
    this.seatEventSource = new EventSource(url);

    this.seatEventSource.addEventListener('seat-status', (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      this.applySeatStatusEvent(data);
    });

    this.seatEventSource.onerror = (err) => {
      console.error('Seat SSE error', err);
    };
  }


  private applySeatStatusEvent(e: SeatStatusEvent) {
    // không đúng suất chiếu hiện tại thì bỏ qua
    if (!this.selectedShowtime || e.lichChieuId !== this.selectedShowtime.lichChieuId) {
      return;
    }

    // tìm ghế trong this.seats
    for (const row of this.seats) {
      for (const s of row) {
        if (s.code === e.nhanGhe) {
          if (e.status === 'BOOKED') {
            s.status = 'booked';
          } else if (e.status === 'HELD') {
            // người khác giữ – mình disable ghế
            if (s.status !== 'selected') {
              s.status = 'booked'; // hoặc tạo thêm state 'held'
            }
          } else if (e.status === 'AVAILABLE') {
            if (s.status !== 'selected') {
              s.status = 'available';
            }
          }
          return;
        }
      }
    }
  }

  closeSeatModal() {
    // this.clearHoldTimer();
    this.seatModalOpen = false;
    this.selectedShowtime = null;
    this.clearHoldTimer();
    this.holdRemainingSeconds = 0;
    if (this.seatEventSource) {
      this.seatEventSource.close();
      this.seatEventSource = undefined;
    }
  }

  private startHoldTimer() {
    // reset timer cũ (nếu có)
    this.clearHoldTimer();

    this.holdRemainingSeconds = this.holdDurationSeconds;

    this.holdTimerId = setInterval(() => {
      this.holdRemainingSeconds--;

      if (this.holdRemainingSeconds <= 0) {
        this.holdRemainingSeconds = 0;
        this.clearHoldTimer();
        this.onHoldExpired();
      }
    }, 1000);
  }

  private clearHoldTimer() {
    if (this.holdTimerId) {
      clearInterval(this.holdTimerId);
      this.holdTimerId = null;
    }
  }

  // private onHoldExpired() {
  //   // Hết giờ: bỏ chọn tất cả ghế đang selected
  //   this.seats = this.seats.map(row =>
  //     row.map(seat =>
  //       seat.status === 'selected' ? { ...seat, status: 'available' } : seat
  //     )
  //   );

  //   alert('Thời gian giữ ghế đã hết, vui lòng chọn lại.');
  // }

  private onHoldExpired() {
    if (!this.selectedShowtime) return;

    const lichChieuId = this.selectedShowtime.lichChieuId;
    const seatsToRelease = this.selectedSeats;

    if (!seatsToRelease.length) return;

    const seatIds = seatsToRelease.map(s => s.seatId);

    this.scheduleService.releaseSeats(lichChieuId, seatIds).subscribe({
      next: () => {
        // reset UI
        this.seats = this.seats.map(row =>
          row.map(seat =>
            seat.status === 'selected' ? { ...seat, status: 'available' } : seat
          )
        );
      },
      error: (err) => {
        console.error('Release seats on timeout error', err);
        // Dù lỗi thì vẫn reset UI để user không bị kẹt
        this.seats = this.seats.map(row =>
          row.map(seat =>
            seat.status === 'selected' ? { ...seat, status: 'available' } : seat
          )
        );
      }
    });

    alert('Thời gian giữ ghế đã hết, vui lòng chọn lại.');
  }


  // Dùng cho hiển thị mm:ss trên UI
  get holdMinutes(): number {
    return Math.floor(this.holdRemainingSeconds / 60);
  }

  get holdSeconds(): string {
    const s = this.holdRemainingSeconds % 60;
    return s < 10 ? '0' + s : '' + s;
  }



  // tạo layout ghế demo (7 hàng thường trên, 7 hàng VIP dưới)
  // buildSeatLayout() {
  //   const rowsTop = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];      // ghế thường
  //   const rowsBottom = ['H', 'I', 'J', 'K', 'L', 'M', 'N'];   // ghế VIP
  //   const cols = 16;
  //   const seats: Seat[][] = [];

  //   rowsTop.forEach(row => {
  //     const rowSeats: Seat[] = [];
  //     for (let col = 1; col <= cols; col++) {
  //       const id = `${row}${col}`;
  //       const status: SeatStatus = Math.random() < 0.1 ? 'booked' : 'available';
  //       rowSeats.push({ id, row, col, type: 'normal', status, heSoGia: 1 });
  //     }
  //     seats.push(rowSeats);
  //   });

  //   rowsBottom.forEach(row => {
  //     const rowSeats: Seat[] = [];
  //     for (let col = 1; col <= cols; col++) {
  //       const id = `${row}${col}`;
  //       const status: SeatStatus = Math.random() < 0.15 ? 'booked' : 'available';
  //       rowSeats.push({ id, row, col, type: 'vip', status, heSoGia: 1.5 });
  //     }
  //     seats.push(rowSeats);
  //   });

  //   this.seats = seats;
  // }

  // click chọn / bỏ chọn ghế
  // toggleSeat(seat: Seat) {
  //   if (!this.selectedShowtime) return;

  //   // Ghế đã bị người khác giữ hoặc đã đặt: không cho click
  //   if (seat.status === 'booked') return;

  //   const lichChieuId = this.selectedShowtime.lichChieuId;
  //   const isSelecting = seat.status !== 'selected';

  //   if (isSelecting) {
  //     // Gọi API giữ ghế
  //     console.log('Giữ ghế', seat.seatId);
  //     this.scheduleService.holdSeats(lichChieuId, [seat.seatId]).subscribe({
  //       next: () => {
  //         // Nếu giữ thành công, mình cho ghế là selected
  //         seat.status = 'selected';
  //       },
  //       error: (err) => {
  //         console.error('Giữ ghế thất bại', err);
  //         alert('Ghế đã bị người khác chọn trước, vui lòng chọn ghế khác.');
  //       }
  //     });
  //   } else {
  //     // Bỏ chọn -> release
  //     this.scheduleService.releaseSeats(lichChieuId, [seat.seatId]).subscribe({
  //       next: () => {
  //         seat.status = 'available';
  //       },
  //       error: (err) => {
  //         console.error('Hủy giữ ghế thất bại', err);
  //       }
  //     });
  //   }
  // }

  toggleSeat(seat: Seat) {
    // Phải có suất chiếu đã chọn
    if (!this.selectedShowtime) return;

    // Ghế đã BOOKED (đặt rồi / đang bị giữ bởi người khác từ BE) thì không cho click
    if (seat.status === 'booked') return;

    const lichChieuId = this.selectedShowtime.lichChieuId;
    const isSelecting = seat.status !== 'selected';

    if (isSelecting) {
      // --- CHỌN GHẾ: gọi API giữ ghế ---
      console.log('Giữ ghế', seat.seatId);
      this.scheduleService.holdSeats(lichChieuId, [seat.seatId]).subscribe({
        next: () => {
          // Nếu giữ thành công -> chuyển ghế sang selected
          seat.status = 'selected';

          // Sau khi set status, selectedSeats getter sẽ tính lại
          const selectedCount = this.selectedSeats.length;

          // Nếu đây là ghế đầu tiên được chọn -> start timer
          if (selectedCount === 1) {
            this.startHoldTimer();
          }
        },
        error: (err) => {
          console.error('Giữ ghế thất bại', err);
          alert('Ghế đã bị người khác chọn trước, vui lòng chọn ghế khác.');
        }
      });
    } else {
      // --- BỎ CHỌN GHẾ: gọi API release ---
      this.scheduleService.releaseSeats(lichChieuId, [seat.seatId]).subscribe({
        next: () => {
          seat.status = 'available';

          const selectedCount = this.selectedSeats.length;

          // Nếu bỏ chọn xong không còn ghế nào -> tắt timer
          if (selectedCount === 0) {
            this.clearHoldTimer();
            this.holdRemainingSeconds = 0;
          }
        },
        error: (err) => {
          console.error('Hủy giữ ghế thất bại', err);
        }
      });
    }
  }





}
