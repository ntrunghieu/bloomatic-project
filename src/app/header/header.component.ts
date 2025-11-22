import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type MiniMovie = {
  id: number;
  title: string;
  poster: string;
  genres: string;
  rating: number;
  nowPlaying?: boolean;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
 // state
  searchOpen = false;
  q = '';
  recent = ['Nhà Gia Tiên'];
   // state modal auth
  authModalOpen = false;
  authMode: 'login' | 'register' = 'login';

  loginModel = {
    email: '',
    password: '',
  };

  registerModel = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  nowShowing: MiniMovie[] = [
    { id: 1, title: 'Cục Vàng Của Ngoại', poster: 'https://picsum.photos/80/110?1', genres: 'Chính Kịch, Gia Đình', rating: 8.6, nowPlaying: true },
    { id: 2, title: 'Cải Mả', poster: 'https://picsum.photos/80/110?2', genres: 'Tâm Linh, Gia Đình', rating: 8.0, nowPlaying: true },
    { id: 3, title: 'Nhà Ma Xó', poster: 'https://picsum.photos/80/110?3', genres: 'Tâm Linh, Gia Đình', rating: 7.1, nowPlaying: true },
    { id: 4, title: 'Tee Yod: Quỷ Ăn Tạng 3', poster: 'https://picsum.photos/80/110?4', genres: 'Kinh Dị, Hành Động', rating: 7.9, nowPlaying: true },
  ];

  // ===== Search =====
  toggleSearch() { this.searchOpen = !this.searchOpen; }
  closeSearch() { this.searchOpen = false; }

   // ===== Auth modal =====
  openLogin() {
    this.authMode = 'login';
    this.authModalOpen = true;
    this.closeSearch();
  }

  openRegister() {
    this.authMode = 'register';
    this.authModalOpen = true;
    this.closeSearch();
  }

  closeAuth() {
    this.authModalOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.closeSearch(); }

  // submit() {
  //   if (!this.q.trim()) return;
  //   this.recent = [this.q.trim(), ...this.recent.filter(x => x !== this.q)].slice(0, 5);
  //   // TODO: điều hướng tới trang kết quả tìm kiếm
  //   this.closeSearch();
  // }

  submit() {
    if (!this.q.trim()) return;
    this.recent = [this.q.trim(), ...this.recent.filter(x => x !== this.q)].slice(0, 5);
    // TODO: điều hướng tới trang kết quả tìm kiếm
    this.closeSearch();
  }

  submitLogin() {
    // TODO: gọi API đăng nhập
    console.log('LOGIN', this.loginModel);
    this.closeAuth();
  }

  submitRegister() {
    // TODO: gọi API đăng ký
    console.log('REGISTER', this.registerModel);
    this.closeAuth();
  }
}
