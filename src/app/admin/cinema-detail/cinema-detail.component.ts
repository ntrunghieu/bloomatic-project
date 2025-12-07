// src/app/admin/cinema-detail/cinema-detail.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CinemaService, RapDto, TaoRapRequest } from '../../services/cinema/cinema.service';
import { PhongDto, RoomService, TaoPhongRequest } from '../../services/room/room.service';

type loaiPhong = 'Tiêu chuẩn' | 'GOLD CLASS' | 'IMAX';

interface CinemaDetail {
  id: number;
  name: string;
  address: string;
  mapAddress?: string;
  createdAt: string;
}

interface PhongChieu {
  maPhong: number;
  tenPhong: string;
  loaiPhong: loaiPhong;
  hang: number;
  cot: number;
  createdAt: string;
}

interface PhongChieuUI extends PhongChieu {
  daCauHinh: boolean
}

type RoomConfigStatus = Record<number, boolean>;

@Component({
  selector: 'app-cinema-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cinema-detail.component.html',
  styleUrls: ['./cinema-detail.component.css'],
})
export class CinemaDetailComponent implements OnInit {
  cinema!: RapDto;
  phong!: PhongDto;
  form: FormGroup;
  rooms: PhongChieu[] = [];
  phongUI: PhongChieuUI[] = [];
  loaiPhong: loaiPhong[] = ['Tiêu chuẩn', 'GOLD CLASS', 'IMAX'];
  filteredRooms: PhongChieuUI[] = [];
  roomConfigStatus: RoomConfigStatus = {};

  // cinema: RapDto | null = null;
  loading = false;

  // modal tạo phòng chiếu
  isRoomModalOpen = false;
  editingRoom: PhongChieu | null = null;
  roomForm: FormGroup;

  // modal xác nhận xóa rạp
  confirmDeleteOpen = false;

  // modal thông báo
  notifyOpen = false;
  notifyTitle = '';
  notifyMessage = '';
  private notifyAfterClose?: () => void;

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
  ];

  // private demoRoomsByCinema: Record<number, PhongChieu[]> = {
  //   1: [
  //     {
  //       maPhong: 101,
  //       tenPhong: 'Cinema 1',
  //       loaiPhong: 'Tiêu chuẩn',
  //       hang: 14,
  //       cot: 16,
  //       createdAt: '2024-04-01',
  //     },
  //     {
  //       maPhong: 102,
  //       tenPhong: 'GOLD CLASS',
  //       loaiPhong: 'GOLD CLASS',
  //       hang: 12,
  //       cot: 12,
  //       createdAt: '2024-04-01',
  //     },
  //     {
  //       maPhong: 103,
  //       tenPhong: 'Cinema 2',
  //       loaiPhong: 'Tiêu chuẩn',
  //       hang: 14,
  //       cot: 18,
  //       createdAt: '2024-04-01',
  //     },
  //     {
  //       maPhong: 104,
  //       tenPhong: 'IMAX',
  //       loaiPhong: 'IMAX',
  //       hang: 16,
  //       cot: 20,
  //       createdAt: '2024-04-01',
  //     },
  //   ],
  // };


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cinemaService: CinemaService,
    private roomService: RoomService
  ) {
    // const id = Number(this.route.snapshot.paramMap.get('id') || '1');

    // this.cinema =
    //   this.demoCinemas.find((c) => c.id === id) ?? this.demoCinemas[0];

    // this.rooms = [...(this.demoRoomsByCinema[this.cinema.id] ?? [])];

    this.form = this.fb.group({
      tenRap: ['', [Validators.required, Validators.maxLength(160)]],
      diaChi: ['', Validators.required],
    });

    this.roomForm = this.fb.group({
      tenPhong: ['', Validators.required],
      loaiPhong: ['', Validators.required],
      hang: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      cot: ['', [Validators.required, Validators.min(1), Validators.max(40)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    console.log('log', id);

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/admin/cinemas/list']);
      return;
    }

    this.cinemaService.chiTietRap(id).subscribe({
      next: (rap: RapDto) => {
        // map BE -> UI model
        this.cinema = {
          id: rap.id,
          tenRap: rap.tenRap,
          diaChi: rap.diaChi,
          createdAt: rap.createdAt ?? new Date().toISOString(),
        };

        // patch form
        this.form.patchValue({
          tenRap: this.cinema.tenRap,
          diaChi: this.cinema.diaChi,
        });

        // tạm dùng demo room theo id rạp (nếu là rạp id=1 sẽ có sẵn)
        // this.rooms = [...(this.demoRoomsByCinema[this.cinema.id] ?? [])];
        this.loadRooms(this.cinema.id);
      },
      error: (err) => {
        console.error('Lỗi load chi tiết rạp', err);
        alert('Không tìm thấy rạp chiếu, quay lại danh sách.');
        this.router.navigate(['/admin/cinemas/list']);
      },
    });

    this.loadRooms(id);
  }

  mapLoaiPhongToLabel(loai: loaiPhong): string {
    switch (loai) {
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

  // Trong ShowtimeSessionListComponent

  loadRooms(id: number) {
    console.log(id);
    this.roomService.danhSachPhong(id).subscribe({
      next: (list) => {
        // 1. Map dữ liệu về PhongChieuUI[] và KHỞI TẠO trường daCauHinh
        this.rooms = list.map((p) => ({
          maPhong: p.maPhong,
          tenPhong: p.tenPhong,
          loaiPhong: p.loaiPhong as loaiPhong,
          hang: p.hang,
          cot: p.cot,
          createdAt: p.createdAt,
          daCauHinh: false
        })) as PhongChieuUI[];

        this.mergeConfigStatus();


      },
      error: (err) => {
        console.error('Lỗi load phòng chiếu', err);
      },
    });
  }

  // BẠN CŨNG PHẢI ĐẢM BẢO RẰNG mergeConfigStatus() ĐƯỢC ĐỊNH NGHĨA:
  mergeConfigStatus() {
    // Chỉ kết hợp nếu cả danh sách phòng và trạng thái đã được tải
    if (this.rooms.length > 0 && Object.keys(this.roomConfigStatus).length > 0) {
      this.rooms = this.rooms.map(room => {
        const maPhong = room.maPhong;
        return {
          ...room,
          // Lấy trạng thái từ map: roomConfigStatus[maPhong] || false
          daCauHinh: this.roomConfigStatus[maPhong] || false
        };
      }) as PhongChieuUI[];
    }
  }

  // ====== cinema actions ======
  goBack() {
    this.router.navigate(['/admin/cinemas/list']);
  }

  updateCinema() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload: TaoRapRequest = {
      tenRap: v.tenRap.trim(),
      diaChi: v.diaChi.trim(),
    };

    this.cinemaService.capNhatRap(this.cinema.id, payload).subscribe({
      next: (rap) => {
        this.cinema.tenRap = rap.tenRap;
        this.cinema.diaChi = rap.diaChi;
        this.openNotify('Cập nhật thành công', 'Thông tin rạp đã được lưu.');
      },
      error: (err) => {
        console.error('Lỗi cập nhật rạp', err);
        this.openNotify('Cập nhật thất bại', 'Vui lòng thử lại sau.');
      },
    });
  }

  openDeleteCinema() {
    this.confirmDeleteOpen = true;
  }

  cancelDeleteCinema() {
    this.confirmDeleteOpen = false;
  }

  confirmDeleteCinema() {
    this.cinemaService.xoaRap(this.cinema.id).subscribe({
      next: () => {
        this.confirmDeleteOpen = false;
        this.openNotify(
          'Xóa rạp thành công',
          `Rạp "${this.cinema.tenRap}" đã được xóa.`,
          () => this.router.navigate(['/admin/cinemas/list'])
        );
      },
      error: (err) => {
        console.error('Lỗi xóa rạp', err);
        this.confirmDeleteOpen = false;
        this.openNotify('Xóa rạp thất bại', 'Vui lòng thử lại sau.');
      },
    });
  }

  deleteCinema() {
    if (confirm('Bạn có chắc muốn xóa rạp chiếu này?')) {
      // console.log('Delete cinema', this.cinema.id);
      // TODO: gọi API xóa
      this.router.navigate(['/admin/cinemas']);
    }
  }

  // ====== rooms actions ======
  capacity(r: PhongChieu): number {
    return r.hang * r.cot;
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
      tenPhong: '',
      loaiPhong: null,
      hang: null,
      cot: null,
    });
    this.isRoomModalOpen = true;
  }

  closeRoomModal() {
    this.isRoomModalOpen = false;
  }

  saveRoom() {
    console.log('id room');
    console.log(this.editingRoom);
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const value = this.roomForm.value as {
      tenPhong: string;
      loaiPhong: loaiPhong;
      hang: number;
      cot: number;
    };

    console.log('Giá trị form khi save:', value);
    console.log('Hàng:', value.hang, 'Cột:', value.cot);

    const payload: TaoPhongRequest = {
      tenPhong: value.tenPhong.trim(),
      loaiPhong: value.loaiPhong,
      hang: value.hang,
      cot: value.cot
    };

    if (this.editingRoom) {
      const editingId = this.editingRoom.maPhong;
      // console.log('id room', editingId);
      // console.log(this.editingRoom);
      this.roomService.capNhatPhong(this.editingRoom.maPhong, payload).subscribe({
        next: (p) => {
          console.log('Dữ liệu phòng chiếu trả về từ API:', p);
          this.editingRoom!.tenPhong = p.tenPhong;
          this.editingRoom!.loaiPhong = p.loaiPhong as loaiPhong;
          this.editingRoom!.hang = p.hang;
          this.editingRoom!.cot = p.cot;

          this.isRoomModalOpen = false;
          this.openNotify('Cập nhật phòng chiếu thành công', '');
        },
        error: (err) => {
          console.error('Lỗi cập nhật phòng', err);
          this.openNotify('Cập nhật phòng chiếu thất bại', 'Vui lòng thử lại.');
        },
      });
    } else {
      this.roomService.taoPhong(this.cinema.id, payload).subscribe({
        next: (p) => {
          this.rooms.push({
            maPhong: p.maPhong,
            tenPhong: p.tenPhong,
            loaiPhong: p.loaiPhong as loaiPhong,
            hang: p.hang,
            cot: p.cot,
            createdAt: p.createdAt
          });
          this.isRoomModalOpen = false;
          this.openNotify('Tạo phòng chiếu thành công', '');
        },
        error: (err) => {
          console.error('Lỗi tạo phòng', err);
          this.openNotify('Tạo phòng chiếu thất bại', 'Vui lòng thử lại.');
        },
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

  goToSeatConfig(room: PhongChieu) {
    console.log('ma phong');
    console.log(room.maPhong);
    const stateRoom = {
      maPhong: room.maPhong,
      tenPhong: room.tenPhong,
      loaiPhong: room.loaiPhong,
      hang: room.hang,
      cot: room.cot,
    };
    // tái dùng route cấu hình ghế hiện có
    this.router.navigate(['/admin/rooms', room.maPhong, 'seat-config'], {
      state: {
        room: stateRoom,
        cinemaId: this.cinema.id,
      },
    });
  }

  editRoom(room: PhongChieu) {
    console.log('day nhe');
    console.log(room);
    this.editingRoom = room;
    // this.roomForm.reset({
    //   maPhong: room.maPhong,
    //   tenPhong: room.tenPhong,
    //   loaiPhong: room.loaiPhong as loaiPhong,
    //   hang: room.hang,
    //   cot: room.cot,
    // });

    this.roomForm.reset();

    this.roomForm.patchValue({
      tenPhong: room.tenPhong,
      loaiPhong: room.loaiPhong,
      hang: room.hang,
      cot: room.cot,
    });
    this.isRoomModalOpen = true;
  }

  // deleteRoom(room: PhongChieu) {
  //   if (confirm(`Xóa phòng chiếu "${room.tenPhong}"?`)) {
  //     this.rooms = this.rooms.filter((r) => r.id !== room.id);
  //   }
  // }

  deleteRoom(room: PhongChieu) {
    if (!confirm(`Xóa phòng chiếu "${room.tenPhong}"?`)) return;

    this.roomService.xoaPhong(room.maPhong).subscribe({
      next: () => {
        this.rooms = this.rooms.filter((r) => r.maPhong !== room.maPhong);
        this.openNotify('Xóa phòng chiếu thành công', '');
      },
      error: (err) => {
        console.error('Lỗi xóa phòng', err);
        this.openNotify('Xóa phòng chiếu thất bại', 'Vui lòng thử lại.');
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN');
  }

  // ====== MODAL THÔNG BÁO ======
  openNotify(title: string, message: string, afterClose?: () => void) {
    this.notifyTitle = title;
    this.notifyMessage = message;
    this.notifyAfterClose = afterClose;
    this.notifyOpen = true;
  }

  closeNotify() {
    this.notifyOpen = false;
    if (this.notifyAfterClose) {
      const fn = this.notifyAfterClose;
      this.notifyAfterClose = undefined;
      fn();
    }
  }
}
