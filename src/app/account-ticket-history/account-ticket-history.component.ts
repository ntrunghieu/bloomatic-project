import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';

interface TicketOrder {
  id: string;              // Mã đơn hàng
  movieTitle: string;
  transactionDate: string; // ISO date
  totalAmount: number;

  // Thông tin chi tiết cho modal
  posterUrl: string;
  language: string;
  format: string;
  showTimeLabel: string;   // ví dụ: 'Fri, 22 Sep | 11:00 AM'
  cinemaName: string;
  cinemaAddress: string;
  screenName: string;      // SCREEN 6
  seatLabel: string;       // GOLD - J23
  ticketCount: number;     // 1 ticket(s)
  ticketPrice: number;
  convenienceFee: number;
  discount: number;
  bookingCode: string;     // dùng làm QR + BOOKING ID
}

@Component({
  selector: 'app-account-ticket-history',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './account-ticket-history.component.html',
  styleUrls: ['./account-ticket-history.component.css'],
})
export class AccountTicketHistoryComponent {
  orders: TicketOrder[] = [
    {
      id: '87120200',
      movieTitle: 'Chàng mèo cô đơn',
      transactionDate: '2024-05-15',
      totalAmount: 760000,
      posterUrl:
        'assets/meocodon.jpg', // demo
      language: 'Vietnamese',
      format: '2D Phụ đề',
      showTimeLabel: 'Fri, 15 May | 10:25 AM',
      cinemaName: 'HCinema Aeon Hà Đông',
      cinemaAddress:
        'Tầng 3 & 4 – TTTM AEON MALL Hà Đông, P. Dương Nội, Q. Hà Đông, Hà Nội',
      screenName: 'SCREEN 6',
      seatLabel: 'GOLD - J23',
      ticketCount: 1,
      ticketPrice: 295000,
      convenienceFee: 33000,
      discount: 0,
      bookingCode: 'WKNFBZG',
    },
    {
      id: '96176515',
      movieTitle: 'Monkey Man Báo Thù',
      transactionDate: '2024-05-06',
      totalAmount: 1066000,
      posterUrl:
        'assets/meocodon.jpg',
      language: 'English',
      format: '2D',
      showTimeLabel: 'Mon, 06 May | 07:00 PM',
      cinemaName: 'Bloomatic Hùng Vương',
      cinemaAddress: 'Tầng 5 – TTTM Hùng Vương Plaza, TP. Đà Nẵng',
      screenName: 'SCREEN 3',
      seatLabel: 'SILVER - H10, H11',
      ticketCount: 2,
      ticketPrice: 980000,
      convenienceFee: 86000,
      discount: 0,
      bookingCode: 'BK123456',
    },
  ];

  // state modal
  detailOpen = false;
  selectedOrder: TicketOrder | null = null;

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN');
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + 'đ';
  }

  viewDetail(order: TicketOrder): void {
    this.selectedOrder = order;
    this.detailOpen = true;
  }

  closeDetail(): void {
    this.detailOpen = false;
  }
}
