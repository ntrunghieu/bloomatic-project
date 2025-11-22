import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ComboItem {
  name: string;
  price: number;
}

interface BookingSummary {
  bookingCode: string;
  movieTitle: string;
  ageRating: string;
  timeRange: string;
  dateLabel: string;
  cinemaName: string;
  cinemaAddress: string;
  roomName: string;
  formatName: string;
  seats: string[];
  combos: ComboItem[];
  subTotal: number;
  discount: number;
  total: number;
  qrCodeUrl?: string; // sau này bạn có thể gen QR vé
}

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-success.component.html',
  styleUrl: './booking-success.component.css'
})
export class BookingSuccessComponent {
  booking: BookingSummary;

  constructor(private router: Router) {
    // DEMO: lấy data từ state nếu có, ngược lại dùng mock
    const nav = this.router.getCurrentNavigation();
    const stateBooking = nav?.extras.state?.['booking'] as BookingSummary | undefined;

    this.booking =
      stateBooking ?? {
        bookingCode: '#B7120200',
        movieTitle: 'Giải Cứu Hành Tinh',
        ageRating: 'C16',
        timeRange: '10:25 ~ 12:40',
        dateLabel: '15/05/2024',
        cinemaName: 'HCinema Aeon Hà Đông',
        cinemaAddress: 'Tầng 3 & 4 – TTTM AEON MALL Hà Đông, P. Dương Nội, Q. Hà Đông, Hà Nội',
        roomName: 'Cinema 2',
        formatName: '2D Phụ đề',
        seats: ['J12', 'J13', 'J14', 'J15'],
        combos: [
          { name: '2 x MY COMBO', price: 174000 },
          { name: '2 x HCINEMA COMBO', price: 226000 },
        ],
        subTotal: 760000,
        discount: 0,
        total: 760000,
        qrCodeUrl: '', // có thể để trống, phần QR mình demo hình placeholder
      };
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + 'đ';
  }

  goHome(): void {
    this.router.navigateByUrl('/');
  }
}
