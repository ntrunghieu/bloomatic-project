// src/app/admin/room-list/room-list.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type loaiPhong = '2D' | '3D' | 'IMAX' | 'VIP';

export interface AdminRoom {
  id: number;
  tenPhong: string;
  loaiPhong: loaiPhong;
  hang: number;
  cot: number;
}

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent {
  rooms: AdminRoom[] = [
    { id: 1, tenPhong: 'Cinema 1', loaiPhong: '2D', hang: 10, cot: 16 },
    { id: 2, tenPhong: 'Cinema 2', loaiPhong: '3D', hang: 12, cot: 18 },
  ];

  loaiPhong: loaiPhong[] = ['2D', '3D', 'IMAX', 'VIP'];

  // form tạo mới
  createForm: FormGroup;
  createModalOpen = false;
  // flag mở modal (đặt tên rõ ràng luôn)
  isCreateModalOpen = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      type: ['2D', Validators.required],
      rows: [10, [Validators.required, Validators.min(1), Validators.max(20)]],
      cols: [16, [Validators.required, Validators.min(1), Validators.max(30)]],
    });
  }

  openCreateModal(): void {
    console.log('openCreateModal called');
    this.createForm.setValue({
      name: '',
      type: '2D',
      rows: 10,
      cols: 16,
    });
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.value as {
      tenPhong: string;
      loaiPhong: loaiPhong;
      hang: number;
      cot: number;
    };

    const newId =
      this.rooms.length > 0
        ? Math.max(...this.rooms.map((r) => r.id)) + 1
        : 1;

    const room: AdminRoom = {
      id: newId,
      tenPhong: value.tenPhong,
      loaiPhong: value.loaiPhong,
      hang: value.hang,
      cot: value.cot,
    };

    this.rooms.push(room);

    this.isCreateModalOpen = false;

    // demo: điều hướng tới cấu hình ghế
    this.router.navigate(['/admin', 'rooms', room.id, 'seat-config'], {
      state: { room },
    });
  }

  goToSeatConfig(room: AdminRoom): void {
    this.router.navigate(['/admin', 'rooms', room.id, 'seat-config'], {
      state: { room },
    });
  }
}
