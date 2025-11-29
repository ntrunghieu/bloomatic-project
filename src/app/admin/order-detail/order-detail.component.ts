// src/app/admin/order-detail/order-detail.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type OrderStatus = 'Đã thanh toán' | 'Đã hủy' | 'Chờ thanh toán';
type TicketStatus = 'ISSUED' | 'USED' | 'CANCELLED';

interface SeatLine {
  seatLabel: string;
  seatType: string;
  price: number;
}

interface TicketLine {
  id: number;
  code: string;           // ma_so_ve
  status: TicketStatus;
  issueTime: string;      // ISO string / datetime
  usedTime?: string | null;

  seatLabel: string;      // A1, C5...
  seatType: string;       // Ghế thường / VIP / Couple...
  unitPrice: number;      // đơn giá 1 vé
  finalPrice: number;     // nếu có giảm giá, phụ phí...
  qrPayload: string;      // du_lieu_qr (string)
}

interface OrderDetail {
  id: number;
  code: string;
  movieTitle: string;
  showTimeRange: string;
  showDate: string;
  roomName: string;
  cinemaName: string;
  bookedDate: string;

  status: OrderStatus;
  amount: number;
  discount: number;
  total: number;

  customerName: string;
  customerPhone: string;
  customerEmail: string;

  tickets: TicketLine[];
}

// interface OrderDetail {
//   id: number;
//   code: string;
//   movieTitle: string;
//   showTimeRange: string;
//   showDate: string;
//   roomName: string;
//   cinemaName: string;
//   bookedDate: string;

//   status: OrderStatus;
//   amount: number;
//   discount: number;
//   total: number;

//   customerName: string;
//   customerPhone: string;
//   customerEmail: string;

//   seats: SeatLine[];
// }

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  order: OrderDetail | undefined;

  // tab hiện tại: 'info' = thông tin đơn / 'tickets' = vé & QR
  activeTab: 'info' | 'tickets' = 'info';

  // ticket đang được xem QR trong modal
  selectedTicket: TicketLine | null = null;

  // mock data: sau này bạn thay bằng API
  private mockOrders: OrderDetail[] = [
    {
      id: 1,
      code: '96175515',
      movieTitle: 'Monkey Man Báo Thù',
      showTimeRange: '20:25 ~ 22:20',
      showDate: '06-05-2024',
      roomName: 'IMAX',
      cinemaName: 'HCinema Aeon Hà Đông',
      bookedDate: '06-05-2024',
      status: 'Đã thanh toán',
      amount: 1066000,
      discount: 0,
      total: 1066000,
      customerName: 'Hiền Super',
      customerPhone: '0344005816',
      customerEmail: 'hien@gmail.com',
      tickets: [
        {
          id: 101,
          code: '96175515-01',
          status: 'ISSUED',
          issueTime: '2024-05-06T19:10:00',
          usedTime: null,
          seatLabel: 'A1',
          seatType: 'Ghế thường',
          unitPrice: 100000,
          finalPrice: 100000,
          qrPayload: '{"ticket":"96175515-01","order":"96175515"}',
        },
        {
          id: 102,
          code: '96175515-02',
          status: 'USED',
          issueTime: '2024-05-06T19:10:01',
          usedTime: '2024-05-06T20:10:00',
          seatLabel: 'C2',
          seatType: 'Ghế thường',
          unitPrice: 100000,
          finalPrice: 100000,
          qrPayload: '{"ticket":"96175515-02","order":"96175515"}',
        },
        // thêm các vé khác nếu muốn
      ],
    },
    // thêm 1–2 order demo khác nếu muốn
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.order = this.mockOrders.find(o => o.id === id);
  }

  setTab(tab: 'info' | 'tickets') {
    this.activeTab = tab;
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

  ticketStatusClass(status: TicketStatus): string {
    switch (status) {
      case 'ISSUED':
        return 'ticket-issued';
      case 'USED':
        return 'ticket-used';
      case 'CANCELLED':
        return 'ticket-cancelled';
    }
  }

  openTicketModal(ticket: TicketLine) {
    console.log('openTicketModal', ticket);
    this.selectedTicket = ticket;
  }

  closeTicketModal() {
    this.selectedTicket = null;
  }

  formatDateTime(dt: string | null | undefined): string {
    if (!dt) return '-';
    const d = new Date(dt);
    return d.toLocaleString('vi-VN');
  }
}
