// src/app/admin/room-seat-config/room-seat-config.component.ts
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminRoom } from '../room-list/room-list.component';

type SeatType = 'EMPTY' | 'STANDARD' | 'VIP' | 'COUPLE' | 'BLOCK';

interface SeatCell {
  id: string;
  type: SeatType;
  coupleGroupId?: string | null;
  coupleRole?: 'MAIN' | 'GHOST' | null;
}

@Component({
  selector: 'app-room-seat-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-seat-config.component.html',
  styleUrls: ['./room-seat-config.component.css'],
})
export class RoomSeatConfigComponent {
  room!: AdminRoom;
  seats: SeatCell[][] = [];
  selectedSeatType: SeatType = 'STANDARD';
  previousCinemaId: number | null = null;
  isDragging = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    const nav = this.router.getCurrentNavigation();
    const stateRoom = nav?.extras.state?.['room'] as AdminRoom | undefined;

    const cinemaIdFromState = nav?.extras.state?.['cinemaId'] as number | undefined;
    this.previousCinemaId = cinemaIdFromState ?? null;
    const idParam = Number(this.route.snapshot.paramMap.get('id'));

    // demo: nếu không có state thì tạo tạm
    this.room =
      stateRoom ?? {
        id: idParam || 0,
        name: `Cinema ${idParam || 1}`,
        type: '2D',
        rows: 10,
        cols: 16,
      };

    this.buildGrid();
  }

  goBackToCinema() {
    if (this.previousCinemaId) {
      this.router.navigate(['/admin/cinemas', this.previousCinemaId]);
    } else {
      // fallback nếu không có cinemaId (ví dụ truy cập trực tiếp URL)
      this.router.navigate(['/admin/cinemas/list']);
    }
  }

  buildGrid() {
    this.seats = [];
    for (let r = 0; r < this.room.rows; r++) {
      const row: SeatCell[] = [];
      const rowLetter = String.fromCharCode(65 + r); // A,B,C...
      for (let c = 1; c <= this.room.cols; c++) {
        row.push({
          id: `${rowLetter}${c}`,
          type: 'EMPTY',
          coupleGroupId: null,
          coupleRole: null,
        });
      }
      this.seats.push(row);
    }
  }

  rowLabel(index: number): string {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, ...
  }


  setSeatType(type: SeatType) {
    this.selectedSeatType = type;
  }

  seatClasses(cell: SeatCell) {
    const classes = [cell.type.toLowerCase()]; // 'empty', 'standard', 'vip', 'couple', 'block'

    if (cell.type === 'COUPLE') {
      if (cell.coupleRole === 'MAIN') {
        classes.push('couple-main');
      } else if (cell.coupleRole === 'GHOST') {
        classes.push('couple-ghost');
      }
    }

    return classes;
  }

  seatLabel(cell: SeatCell): string {
    if (cell.type === 'COUPLE' && cell.coupleRole === 'MAIN' && cell.coupleGroupId) {
      // "K1-K2" -> thay '-' bằng '–' cho đẹp
      return cell.coupleGroupId.replace('-', '–');
    }

    if (cell.type === 'COUPLE' && cell.coupleRole === 'GHOST') {
      return '';
    }

    return cell.id;
  }


  private clearCoupleGroup(groupId: string) {
    for (const row of this.seats) {
      for (const seat of row) {
        if (seat.coupleGroupId === groupId) {
          seat.coupleGroupId = null;
          seat.type = 'EMPTY';
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
    const cell = this.seats[rowIndex][colIndex];

    // ===== GHẾ COUPLE =====
    if (this.selectedSeatType === 'COUPLE') {
      // chỉ xử lý ở lần bấm đầu, không áp dụng khi kéo chuột qua
      if (!isFirst) return;

      // đang là couple -> click lại để huỷ cả cặp
      if (cell.type === 'COUPLE' && cell.coupleGroupId) {
        this.clearCoupleGroup(cell.coupleGroupId);
        return;
      }

      const partner = this.seats[rowIndex][colIndex + 1];

      // không có ghế bên phải hoặc bị khoá
      if (!partner || partner.type === 'BLOCK') {
        alert('Ghế couple phải là 2 ghế trống liền kề cùng hàng.');
        return;
      }

      // xoá group cũ nếu có
      if (partner.coupleGroupId) this.clearCoupleGroup(partner.coupleGroupId);
      if (cell.coupleGroupId) this.clearCoupleGroup(cell.coupleGroupId);

      const groupId = `${cell.id}-${partner.id}`;

      cell.type = 'COUPLE';
      partner.type = 'COUPLE';

      cell.coupleGroupId = groupId;
      partner.coupleGroupId = groupId;

      cell.coupleRole = 'MAIN';   // ghế bên trái: ô chính (rộng gấp đôi)
      partner.coupleRole = 'GHOST'; // ghế bên phải: ô “ẩn”, chỉ để chiếm chỗ
      return;
    }

    // ===== GHẾ THƯỜNG / VIP / BLOCK =====

    // nếu đang là couple thì xoá luôn cặp trước khi tô loại khác
    if (cell.type === 'COUPLE' && cell.coupleGroupId) {
      this.clearCoupleGroup(cell.coupleGroupId);
    }

    if (isFirst) {
      // click lần đầu: toggle
      if (cell.type === this.selectedSeatType) {
        cell.type = 'EMPTY';
        cell.coupleGroupId = null;
      } else {
        cell.type = this.selectedSeatType;
        cell.coupleGroupId = null;
      }
    } else {
      // đang kéo: cứ tô theo loại đang chọn, không toggle
      if (cell.type !== this.selectedSeatType) {
        cell.type = this.selectedSeatType;
        cell.coupleGroupId = null;
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
    console.log('Save layout for room', this.room, this.seats);
    alert('Đã lưu cấu hình (demo). Sau này sẽ gọi API lưu layout.');
  }

}
