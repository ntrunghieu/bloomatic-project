// src/app/admin/order-list/order-list.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

type OrderStatus = 'Đã thanh toán' | 'Đã hủy' | 'Chờ thanh toán';

interface OrderSummary {
  id: number;           // id dùng cho route chi tiết
  code: string;         // mã đơn hàng
  movieTitle: string;
  showTimeRange: string; // "20:25 ~ 22:20"
  showDate: string;      // "06-05-2024"
  roomName: string;      // "IMAX • HCinema Aeon Hà Đông"
  status: OrderStatus;
  totalAmount: number;   // số tiền
  bookedDate: string;    // "06-05-2024"
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent {
  // ===== MOCK DATA =====
  orders: OrderSummary[] = [
    {
      id: 1,
      code: '96175515',
      movieTitle: 'Monkey Man Báo Thù',
      showTimeRange: '20:25 ~ 22:20',
      showDate: '06-05-2024',
      roomName: 'IMAX • HCinema Aeon Hà Đông',
      status: 'Đã thanh toán',
      totalAmount: 1066000,
      bookedDate: '06-05-2024',
    },
    {
      id: 2,
      code: '45341960',
      movieTitle: 'Quý Cái',
      showTimeRange: '20:10 ~ 22:05',
      showDate: '06-05-2024',
      roomName: 'GOLD CLASS • HCinema Vincom Royal City',
      status: 'Đã thanh toán',
      totalAmount: 1884000,
      bookedDate: '24-04-2024',
    },
    {
      id: 3,
      code: '81159823',
      movieTitle: 'SUGA | Agust D TOUR “D-DAY” The Movie',
      showTimeRange: '19:30 ~ 21:15',
      showDate: '20-04-2024',
      roomName: 'IMAX • HCinema Mac Plaza (Machinco)',
      status: 'Đã thanh toán',
      totalAmount: 454000,
      bookedDate: '20-04-2024',
    },
    {
      id: 4,
      code: '104565786',
      movieTitle: 'Quý Cái',
      showTimeRange: '15:10 ~ 17:00',
      showDate: '16-04-2024',
      roomName: 'GOLD CLASS • HCinema Vincom Royal City',
      status: 'Đã hủy',
      totalAmount: 908000,
      bookedDate: '16-04-2024',
    },
    // ... bạn có thể thêm bớt tuỳ ý
  ];

  // ===== TÌM KIẾM + PHÂN TRANG =====
  searchOrderCode = '';
  searchMovieTitle = '';

  page = 1;
  pageSize = 10;

  refresh() {
    // chừa chỗ để sau call API
    console.log('Refresh order list...');
  }

  applyFilters() {
    this.page = 1;
  }

  get filteredOrders(): OrderSummary[] {
    let data = [...this.orders];

    const codeKey = this.searchOrderCode.trim().toLowerCase();
    const movieKey = this.searchMovieTitle.trim().toLowerCase();

    if (codeKey) {
      data = data.filter(o => o.code.toLowerCase().includes(codeKey));
    }
    if (movieKey) {
      data = data.filter(o => o.movieTitle.toLowerCase().includes(movieKey));
    }

    // sort ngày đặt mới nhất lên trên (demo thôi)
    data.sort((a, b) => b.bookedDate.localeCompare(a.bookedDate));
    return data;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN');
  }

  statusClass(status: OrderStatus): string {
    switch (status) {
      case 'Đã thanh toán':
        return 'status-paid';
      case 'Đã hủy':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }
}
