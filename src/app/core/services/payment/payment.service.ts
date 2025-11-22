import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PaypalCreateOrderResponse {
  orderId: string;
  approveUrl: string;
  bookingId: number;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = '/api/payments/paypal';
  constructor() { }

  // MOCK: giả lập gọi API PayPal, trả về luôn một response demo
  createPaypalOrder(payload: any): Observable<PaypalCreateOrderResponse> {
    const mock: PaypalCreateOrderResponse = {
      orderId: 'DEMO_ORDER_001',
      approveUrl: 'https://example.com/paypal-demo-checkout', // sau này thay bằng link PayPal thật
      bookingId: 1,
      amount: payload.amount,
    };

    console.log('PaymentService mock payload =', payload);
    return of(mock);
  }
  // constructor(private http: HttpClient) {}

  // createPaypalOrder(payload: any) {
  //   return this.http.post<PaypalCreateOrderResponse>(
  //     `${this.baseUrl}/create-order`,
  //     payload
  //   );
  // }
}
