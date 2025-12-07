import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

export interface CreatePaypalOrderRequest {
  lichChieuId: number;
  seatIds: number[];
  seatCodes: string[];
  clientAmount: number; // VND
}

export interface CreatePaypalOrderResponse {
  thanhToanId: number;
  orderId: string;
  approveUrl: string | null;
}

export interface PaypalCreateOrderResponse {
  orderId: string;
  approveUrl: string;
  bookingId: number;
  amount: number;
  thanhToanId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.apiBase;
  constructor(private http: HttpClient) { }

  createPaypalOrder(payload: CreatePaypalOrderRequest): Observable<CreatePaypalOrderResponse> {
    return this.http.post<CreatePaypalOrderResponse>(
      `${this.baseUrl}/thanh-toan/paypal/create-order`,
      payload
    );
  }

  capturePaypalOrder(orderId: string, thanhToanId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/thanh-toan/paypal/capture`,
      { orderId, thanhToanId }
    );
  }

  // MOCK: giả lập gọi API PayPal, trả về luôn một response demo
  // createPaypalOrder(payload: any): Observable<PaypalCreateOrderResponse> {
  //   const mock: PaypalCreateOrderResponse = {
  //     orderId: 'DEMO_ORDER_001',
  //     approveUrl: 'https://example.com/paypal-demo-checkout', // sau này thay bằng link PayPal thật
  //     bookingId: 1,
  //     amount: payload.amount,
  //     thanhToanId: 1
  //   };

  //   console.log('PaymentService mock payload =', payload);
  //   return of(mock);
  // }
  // constructor(private http: HttpClient) {}

  // createPaypalOrder(payload: any) {
  //   return this.http.post<PaypalCreateOrderResponse>(
  //     `${this.baseUrl}/create-order`,
  //     payload
  //   );
  // }
}
