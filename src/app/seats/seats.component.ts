import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  selector: 'app-seats',
  imports: [CommonModule, RouterModule],
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.scss']
})
export class SeatsComponent {
  // demo seat map rows
  rows = ['A','B','C','D','E','F','G'];
  cols = Array.from({length:13}, (_,i)=>i+1);
  // for couple row (G) we will render 6 couple seats (each colspan=2)
  coupleCols = Array.from({length:6}, (_,i)=>i+1);

  selectedSeats: string[] = [];
  bookedSeats: string[] = ['A3','A4','B7','D2'];
  totalPrice = 0;
  readonly SEAT_PRICE = 0; // show 0d like screenshot
  readonly MAX_SEATS = 8;

  // determine seat type by row char
  private getSeatType(seatId: string): 'normal'|'vip'|'couple' {
    const row = seatId.charAt(0).toUpperCase();
    if (row === 'G') return 'couple';
    if (['D','E','F'].includes(row)) return 'vip';
    return 'normal';
  }

  // pricing (exposed for template)
  PRICE_NORMAL = 75000;
  PRICE_VIP = 85000;
  PRICE_COUPLE = 170000;

  // return number of seats counted for selection cap (couple counts as 2)
  private seatCountForId(seatId: string) {
    return this.getSeatType(seatId) === 'couple' ? 2 : 1;
  }

  // compute totals breakdown
  getTotals() {
    let normal = 0, vip = 0, couple = 0;
    for (const s of this.selectedSeats) {
      const t = this.getSeatType(s);
      if (t === 'normal') normal++;
      else if (t === 'vip') vip++;
      else couple++;
    }
    const normalTotal = normal * this.PRICE_NORMAL;
    const vipTotal = vip * this.PRICE_VIP;
    const coupleTotal = couple * this.PRICE_COUPLE;
    const total = normalTotal + vipTotal + coupleTotal;
    return { normal, vip, couple, normalTotal, vipTotal, coupleTotal, total };
  }

  // total number of seats counting couple as 2
  selectedSeatCount() {
    return this.selectedSeats.reduce((acc, s) => acc + this.seatCountForId(s), 0);
  }

  toggleSeat(seatId: string) {
    if (this.bookedSeats.includes(seatId)) return;

    const idx = this.selectedSeats.indexOf(seatId);

    // deselect
    if (idx !== -1) {
      this.selectedSeats.splice(idx,1);
      this.totalPrice = this.getTotals().total;
      return;
    }

    // select: enforce max and single-type
    // compute current seat count considering couple=2
    const currentCount = this.selectedSeats.reduce((acc, s) => acc + this.seatCountForId(s), 0);
    const addCount = this.seatCountForId(seatId);
    if (currentCount + addCount > this.MAX_SEATS) {
      alert(`Bạn chỉ được chọn tối đa ${this.MAX_SEATS} ghế (couple tính 2 ghế)!`);
      return;
    }

    const newType = this.getSeatType(seatId);
    if (this.selectedSeats.length > 0) {
      const existingType = this.getSeatType(this.selectedSeats[0]);
      if (existingType !== newType) {
        alert('Mỗi lần chỉ được chọn một loại ghế. Vui lòng bỏ chọn ghế hiện tại trước khi chọn loại khác.');
        return;
      }
    }

    this.selectedSeats.push(seatId);
    // update total using breakdown
    this.totalPrice = this.getTotals().total;
  }
}
