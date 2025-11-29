import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService, OrderRow, Page } from '../../services/account.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './account-orders.component.html',
  styleUrl: './account-orders.component.css'
})
export class AccountOrdersComponent implements OnInit {
  page!: Page<OrderRow>;
  size = 10;

  constructor(private api: AccountService) {}

  ngOnInit() { this.load(0, this.size); }

  load(p: number, s: number) {
    this.api.getOrders(p, s).subscribe(pg => {
      this.page = pg;
      this.size = s;
    });
  }
  go(p: number) { this.load(p, this.size); }
  changeSize(ev: Event) {
    const s = +(ev.target as HTMLSelectElement).value;
    this.load(0, s);
  }
}
