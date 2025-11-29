// src/app/admin/cinema-detail/cinema-detail.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

type RoomType = 'Tiêu chuẩn' | 'GOLD CLASS' | 'IMAX';

interface CinemaDetail {
  id: number;
  name: string;
  address: string;
  mapAddress?: string;
  createdAt: string;
}

interface CinemaRoom {
  id: number;
  name: string;
  type: RoomType;
  rows: number;
  cols: number;
  createdAt: string;
}

@Component({
  selector: 'app-cinema-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cinema-detail.component.html',
  styleUrls: ['./cinema-detail.component.css'],
})
export class CinemaDetailComponent {
  cinema!: CinemaDetail;
  form: FormGroup;

  rooms: CinemaRoom[] = [];
  roomTypes: RoomType[] = ['Tiêu chuẩn', 'GOLD CLASS', 'IMAX'];

  // modal tạo phòng chiếu
  isRoomModalOpen = false;
  editingRoom: CinemaRoom | null = null;
  roomForm: FormGroup;

  // demo data
  private demoCinemas: CinemaDetail[] = [
    {
      id: 1,
      name: 'HCinema Aeon Hà Đông',
      address:
        'Tầng 3 & 4 – TTTM AEON MALL Hà Đông, P. Dương Nội, Q. Hà Đông, Hà Nội',
      mapAddress:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9778!2d105.746!3d20.9803',
      createdAt: '2024-03-10',
    },
    // có thể thêm các rạp demo khác ở đây
  ];

  private demoRoomsByCinema: Record<number, CinemaRoom[]> = {
    1: [
      {
        id: 101,
        name: 'Cinema 1',
        type: 'Tiêu chuẩn',
        rows: 14,
        cols: 16,
        createdAt: '2024-04-01',
      },
      {
        id: 102,
        name: 'GOLD CLASS',
        type: 'GOLD CLASS',
        rows: 12,
        cols: 12,
        createdAt: '2024-04-01',
      },
      {
        id: 103,
        name: 'Cinema 2',
        type: 'Tiêu chuẩn',
        rows: 14,
        cols: 18,
        createdAt: '2024-04-01',
      },
      {
        id: 104,
        name: 'IMAX',
        type: 'IMAX',
        rows: 16,
        cols: 20,
        createdAt: '2024-04-01',
      },
    ],
  };

  typeClass(type: RoomType): string {
    switch (type) {
      case 'Tiêu chuẩn':
        return 'tag-standard';
      case 'GOLD CLASS':
        return 'tag-gold';
      case 'IMAX':
        return 'tag-imax';
      default:
        return 'tag-standard';
    }
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id') || '1');

    this.cinema =
      this.demoCinemas.find((c) => c.id === id) ?? this.demoCinemas[0];

    this.rooms = [...(this.demoRoomsByCinema[this.cinema.id] ?? [])];

    this.form = this.fb.group({
      name: [this.cinema.name, [Validators.required, Validators.maxLength(160)]],
      address: [this.cinema.address, Validators.required],
      mapAddress: [this.cinema.mapAddress || ''],
    });

    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      type: ['Tiêu chuẩn', Validators.required],
      rows: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
      cols: [16, [Validators.required, Validators.min(1), Validators.max(40)]],
    });
  }

  // ====== cinema actions ======
  goBack() {
    this.router.navigate(['/admin/cinemas']);
  }

  updateCinema() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Update cinema payload', this.form.value);
    // TODO: gọi API update
  }

  deleteCinema() {
    if (confirm('Bạn có chắc muốn xóa rạp chiếu này?')) {
      console.log('Delete cinema', this.cinema.id);
      // TODO: gọi API xóa
      this.router.navigate(['/admin/cinemas']);
    }
  }

  // ====== rooms actions ======
  capacity(r: CinemaRoom): number {
    return r.rows * r.cols;
  }

  rowEndLetter(rows: number): string {
    if (!rows || rows < 1) {
      return '';
    }
    // 1 -> A (65), 2 -> B, ...
    return String.fromCharCode(64 + rows);
  }

  openRoomModal() {
    this.editingRoom = null;
    this.roomForm.reset({
      name: '',
      type: 'Tiêu chuẩn',
      rows: 10,
      cols: 16,
    });
    this.isRoomModalOpen = true;
  }

  closeRoomModal() {
    this.isRoomModalOpen = false;
  }

  saveRoom() {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const value = this.roomForm.value as {
      name: string;
      type: RoomType;
      rows: number;
      cols: number;
    };

    if (this.editingRoom) {
      // 👇 CHẾ ĐỘ CẬP NHẬT
      this.editingRoom.name = value.name;
      this.editingRoom.type = value.type;
      this.editingRoom.rows = value.rows;
      this.editingRoom.cols = value.cols;
      // có thể cập nhật createdAt nếu bạn muốn
    } else {
      // 👇 CHẾ ĐỘ TẠO MỚI (giữ code cũ)
      const newId =
        this.rooms.length > 0
          ? Math.max(...this.rooms.map((r) => r.id)) + 1
          : 1;

      this.rooms.push({
        id: newId,
        name: value.name,
        type: value.type,
        rows: value.rows,
        cols: value.cols,
        createdAt: new Date().toISOString(),
      });
    }

    this.isRoomModalOpen = false;

    // const newId =
    //   this.rooms.length > 0
    //     ? Math.max(...this.rooms.map((r) => r.id)) + 1
    //     : 1;

    // this.rooms.push({
    //   id: newId,
    //   name: value.name,
    //   type: value.type,
    //   rows: value.rows,
    //   cols: value.cols,
    //   createdAt: new Date().toISOString(),
    // });

    // this.isRoomModalOpen = false;
  }

  goToSeatConfig(room: CinemaRoom) {
    // tái dùng route cấu hình ghế hiện có
    this.router.navigate(['/admin/rooms', room.id, 'seat-config'], {
      state: { room, cinemaId: this.cinema.id },
    });
  }

  editRoom(room: CinemaRoom) {
    this.editingRoom = room;
    this.roomForm.reset({
      name: room.name,
      type: room.type,
      rows: room.rows,
      cols: room.cols,
    });
    this.isRoomModalOpen = true;
  }

  deleteRoom(room: CinemaRoom) {
    if (confirm(`Xóa phòng chiếu "${room.name}"?`)) {
      this.rooms = this.rooms.filter((r) => r.id !== room.id);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN');
  }
}
