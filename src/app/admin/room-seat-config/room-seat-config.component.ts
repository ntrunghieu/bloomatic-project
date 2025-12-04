// src/app/admin/room-seat-config/room-seat-config.component.ts
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminRoom } from '../room-list/room-list.component';
import { GheLayoutDto, SeatConfigService } from '../../services/seat-config/seat-config.service';

type loaiGhe = 'EMPTY' | 'STANDARD' | 'VIP' | 'COUPLE' | 'BLOCK';
type loaiPhong = '2D' | '3D' | 'IMAX' | 'VIP';

interface SeatCell {
  nhanGhe: string;
  loaiGhe: loaiGhe;
  nhomCouple?: string | null;
  coupleRole?: 'MAIN' | 'GHOST' | null;
}

export interface PhongConfig {
  maPhong: number;
  tenPhong: string;
  loaiPhong: loaiPhong;
  hang: number;
  cot: number;
}


@Component({
  selector: 'app-room-seat-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-seat-config.component.html',
  styleUrls: ['./room-seat-config.component.css'],
})
export class RoomSeatConfigComponent {
  room!: PhongConfig;
  ghe: SeatCell[][] = [];
  selectedSeatType: loaiGhe = 'STANDARD';
  previousCinemaId: number | null = null;
  isDragging = false;

  constructor(private router: Router, private route: ActivatedRoute, private seatConfigService: SeatConfigService,) {

    const maPhongTuUrl = Number(this.route.snapshot.paramMap.get('maPhong'));
    const idPhong = maPhongTuUrl > 0 ? maPhongTuUrl : 0;

    const nav = this.router.getCurrentNavigation();
    const stateRoom = nav?.extras.state?.['room'] as PhongConfig | undefined;

    console.log('stateRoom nằm ở đây');
    console.log(stateRoom);

    const cinemaIdFromState = nav?.extras.state?.['cinemaId'] as number | undefined;
    this.previousCinemaId = cinemaIdFromState ?? null;

    // const idParam = Number(this.route.snapshot.paramMap.get('id'));

    // 3. Khởi tạo this.room
    if (stateRoom) {
      this.room = stateRoom;
    } else {
      this.room = {
        maPhong: idPhong,
        tenPhong: `Phòng ${idPhong}`,
        loaiPhong: '2D',
        hang: 10,
        cot: 16,
      } as any;
      this.room.maPhong = idPhong;
    }

    // demo: nếu không có state thì tạo tạm
    // this.room =
    //   stateRoom ?? {
    //     id: idParam || 0,
    //     tenPhong: `Cinema ${idParam || 1}`,
    //     loaiPhong: '2D',
    //     hang: 10,
    //     cot: 16,
    //   };
    this.loadOrInitGrid();
  }

  goBackToCinema() {
    if (this.previousCinemaId) {
      this.router.navigate(['/admin/cinemas', this.previousCinemaId]);
    } else {
      // fallback nếu không có cinemaId (ví dụ truy cập trực tiếp URL)
      this.router.navigate(['/admin/cinemas/list']);
    }
  }

  private loadOrInitGrid() {
    if (!this.room?.maPhong) {
      this.buildGrid();
      return;
    }

    this.seatConfigService.getLayout(this.room.maPhong).subscribe({
      next: (layout: GheLayoutDto) => {
        // nếu BE trả về layout trống thì vẫn tự buildGrid()
        if (!layout || !layout.gheDTO || layout.gheDTO.length === 0) {
          this.buildGrid();
          return;
        }

        this.room.hang = layout.hang;
        this.room.cot = layout.cot;

        // convert từ list seats (BE) -> grid SeatCell[][] (FE đang dùng)
        this.ghe = [];
        for (let r = 0; r < layout.hang; r++) {
          const row: SeatCell[] = [];
          for (let c = 0; c < layout.cot; c++) {
            const dto = layout.gheDTO.find(
              (s) => s.hang === r && s.cot === c
            );

            if (!dto) {
              // ô không có dữ liệu -> EMPTY
              const rowLetter = String.fromCharCode(65 + r); // A,B,C
              row.push({
                nhanGhe: `${rowLetter}${c + 1}`,
                loaiGhe: 'EMPTY',
                nhomCouple: null,
                coupleRole: null,
              });
            } else {
              row.push({
                nhanGhe: dto.nhanGhe,
                loaiGhe: dto.loaiGhe,
                nhomCouple: dto.nhomCouple ?? null,
                coupleRole: dto.coupleRole ?? null,
              });
            }
          }
          this.ghe.push(row);
        }
      },
      error: (err) => {
        console.error('Lỗi load layout ghế, fallback buildGrid()', err);
        this.buildGrid();
      },
    });
  }

  buildGrid() {
    // this.seats = [];
    // for (let r = 0; r < this.room.rows; r++) {
    //   const row: SeatCell[] = [];
    //   const rowLetter = String.fromCharCode(65 + r);
    //   for (let c = 1; c <= this.room.cols; c++) {
    //     row.push({
    //       id: `${rowLetter}${c}`,
    //       type: 'EMPTY',
    //       coupleGroupId: null,
    //       coupleRole: null,
    //     });
    //   }
    //   this.seats.push(row);
    // }

    this.ghe = [];
    for (let r = 0; r < this.room.hang; r++) {
      const row: SeatCell[] = [];
      const rowLetter = String.fromCharCode(65 + r); // A,B,C...
      for (let c = 0; c < this.room.cot; c++) {
        row.push({
          nhanGhe: `${rowLetter}${c + 1}`,
          loaiGhe: 'STANDARD', // hoặc 'EMPTY' nếu muốn mặc định không ghế
          nhomCouple: null,
          coupleRole: null,
        });
      }
      this.ghe.push(row);
    }
  }

  rowLabel(index: number): string {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, ...
  }


  setSeatType(type: loaiGhe) {
    this.selectedSeatType = type;
  }

  seatClasses(cell: SeatCell) {
    const classes = [cell.loaiGhe.toLowerCase()]; // 'empty', 'standard', 'vip', 'couple', 'block'

    if (cell.loaiGhe === 'COUPLE') {
      if (cell.coupleRole === 'MAIN') {
        classes.push('couple-main');
      } else if (cell.coupleRole === 'GHOST') {
        classes.push('couple-ghost');
      }
    }

    return classes;
  }

  seatLabel(cell: SeatCell): string {
    if (cell.loaiGhe === 'COUPLE' && cell.coupleRole === 'MAIN' && cell.nhomCouple) {
      // "K1-K2" -> thay '-' bằng '–' cho đẹp
      return cell.nhomCouple.replace('-', '–');
    }

    if (cell.loaiGhe === 'COUPLE' && cell.coupleRole === 'GHOST') {
      return '';
    }

    return cell.nhanGhe;
  }


  private clearCoupleGroup(groupId: string) {
    for (const row of this.ghe) {
      for (const seat of row) {
        if (seat.nhomCouple === groupId) {
          seat.nhomCouple = null;
          seat.loaiGhe = 'EMPTY';
          seat.coupleRole = null;
        }
      }
    }
  }





  // áp dụng type hiện tại, nếu bấm lại cùng loại thì trả về EMPTY
  // private applySeatType(cell: SeatCell) {
  //   cell.type =
  //     cell.type === this.selectedSeatType ? 'EMPTY' : this.selectedSeatType;
  // }

  private applySeatType(rowIndex: number, colIndex: number, isFirst: boolean) {
    const cell = this.ghe[rowIndex][colIndex];

    // ===== GHẾ COUPLE =====
    if (this.selectedSeatType === 'COUPLE') {
      // chỉ xử lý ở lần bấm đầu, không áp dụng khi kéo chuột qua
      if (!isFirst) return;

      // đang là couple -> click lại để huỷ cả cặp
      if (cell.loaiGhe === 'COUPLE' && cell.nhomCouple) {
        this.clearCoupleGroup(cell.nhomCouple);
        return;
      }

      const partner = this.ghe[rowIndex][colIndex + 1];

      // không có ghế bên phải hoặc bị khoá
      if (!partner || partner.loaiGhe === 'BLOCK') {
        alert('Ghế couple phải là 2 ghế trống liền kề cùng hàng.');
        return;
      }

      // xoá group cũ nếu có
      if (partner.nhomCouple) this.clearCoupleGroup(partner.nhomCouple);
      if (cell.nhomCouple) this.clearCoupleGroup(cell.nhomCouple);

      const groupId = `${cell.nhanGhe}-${partner.nhanGhe}`;

      cell.loaiGhe = 'COUPLE';
      partner.loaiGhe = 'COUPLE';

      cell.nhomCouple = groupId;
      partner.nhomCouple = groupId;

      cell.coupleRole = 'MAIN';   // ghế bên trái: ô chính (rộng gấp đôi)
      partner.coupleRole = 'GHOST'; // ghế bên phải: ô “ẩn”, chỉ để chiếm chỗ
      return;
    }

    // ===== GHẾ THƯỜNG / VIP / BLOCK =====

    // nếu đang là couple thì xoá luôn cặp trước khi tô loại khác
    if (cell.loaiGhe === 'COUPLE' && cell.nhomCouple) {
      this.clearCoupleGroup(cell.nhomCouple);
    }

    if (isFirst) {
      // click lần đầu: toggle
      if (cell.loaiGhe === this.selectedSeatType) {
        cell.loaiGhe = 'EMPTY';
        cell.nhomCouple = null;
      } else {
        cell.loaiGhe = this.selectedSeatType;
        cell.nhomCouple = null;
      }
    } else {
      // đang kéo: cứ tô theo loại đang chọn, không toggle
      if (cell.loaiGhe !== this.selectedSeatType) {
        cell.loaiGhe = this.selectedSeatType;
        cell.nhomCouple = null;
      }
    }
  }




  // toggleSeat(cell: SeatCell) {
  //   cell.type = this.selectedSeatType;
  // }
  // toggleSeat(rowIndex: number, colIndex: number) {
  //   const cell = this.seats[rowIndex][colIndex];

  //   // ====== Trường hợp đang cấu hình ghế couple ======
  //   if (this.selectedSeatType === 'COUPLE') {
  //     // nếu ghế này đã là couple -> click lại để bỏ cả cặp
  //     if (cell.type === 'COUPLE' && cell.coupleGroupId) {
  //       this.clearCoupleGroup(cell.coupleGroupId);
  //       return;
  //     }

  //     // chọn ghế bên phải làm ghế cặp
  //     const partner = this.seats[rowIndex][colIndex + 1];

  //     // không có ghế bên phải hoặc đang bị khoá -> không cho cấu hình couple
  //     if (!partner || partner.type === 'BLOCK') {
  //       alert('Ghế couple phải là 2 ghế trống liền kề cùng hàng.');
  //       return;
  //     }

  //     // nếu ghế bên phải đang là couple của group khác -> xoá group cũ trước
  //     if (partner.coupleGroupId) {
  //       this.clearCoupleGroup(partner.coupleGroupId);
  //     }
  //     if (cell.coupleGroupId) {
  //       this.clearCoupleGroup(cell.coupleGroupId);
  //     }

  //     const groupId = `${cell.id}-${partner.id}`;
  //     cell.type = 'COUPLE';
  //     partner.type = 'COUPLE';
  //     cell.coupleGroupId = groupId;
  //     partner.coupleGroupId = groupId;
  //     return;
  //   }

  //   // ====== Trường hợp ghế thường / VIP / BLOCK ======

  //   // nếu ghế hiện tại đang là couple -> xoá cả cặp trước
  //   if (cell.type === 'COUPLE' && cell.coupleGroupId) {
  //     this.clearCoupleGroup(cell.coupleGroupId);
  //   }

  //   // toggle: nếu đang đúng loại thì trả về EMPTY, ngược lại set sang type đang chọn
  //   if (cell.type === this.selectedSeatType) {
  //     cell.type = 'EMPTY';
  //     cell.coupleGroupId = null;
  //   } else {
  //     cell.type = this.selectedSeatType;
  //     cell.coupleGroupId = null;
  //   }
  // }

  // bắt đầu kéo: chuột xuống tại 1 ghế
  onSeatMouseDown(rowIndex: number, colIndex: number, event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.applySeatType(rowIndex, colIndex, true);
  }

  onSeatMouseEnter(rowIndex: number, colIndex: number, event: MouseEvent) {
    if (!this.isDragging) return;
    // với couple, applySeatType sẽ ignore khi isFirst = false nên không sợ loạn
    this.applySeatType(rowIndex, colIndex, false);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  saveConfig() {
    console.log(this.room?.maPhong);
    if (!this.room?.maPhong) {
      alert('Không xác định được phòng chiếu.');
      return;
    }

    const hang = this.ghe.length;
    const cot = this.ghe[0]?.length ?? 0;

    const seatsPayload = this.ghe.flatMap((row, r) =>
      row.map((cell, c) => ({
        nhanGhe: cell.nhanGhe,
        hang: r,
        cot: c,
        loaiGhe: cell.loaiGhe,
        nhomCouple: cell.nhomCouple ?? null,
        coupleRole: cell.coupleRole ?? null,
      }))
    );

    const payload: GheLayoutDto = {
      hang,
      cot,
      gheDTO: seatsPayload,
    };

    this.seatConfigService.saveLayout(this.room.maPhong, payload).subscribe({
      next: () => {
        alert('Lưu cấu hình ghế thành công');
      },
      error: (err) => {
        console.error('Lỗi lưu cấu hình ghế', err);
        alert('Lưu cấu hình ghế thất bại, vui lòng thử lại.');
      },
    });
  }


  // saveConfig() {
  //   console.log('Save layout for room', this.room, this.o_ghe);
  //   alert('Đã lưu cấu hình (demo). Sau này sẽ gọi API lưu layout.');
  // }

}
