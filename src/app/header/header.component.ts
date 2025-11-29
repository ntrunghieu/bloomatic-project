import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
export class HeaderComponent implements OnInit {
  [x: string]: any;
  // state
  searchOpen = false;
  q = '';
  recent = ['Nhà Gia Tiên'];
  // state modal auth
  authModalOpen = false;
  authMode: 'login' | 'register' = 'login';

  // loginModel = {
  //   email: '',
  //   password: '',
  // };

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

  err = '';
  loginModel!: FormGroup;

  user: any = null;          // dữ liệu user sau đăng nhập
  menuOpen = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }
  ngOnInit(): void {
    this.loginModel = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.auth.currentUser$?.subscribe(u => {
      this.user = u;
    });
  }

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
    // console.log('LOGIN', this.loginModel);
    // this.closeAuth();
    if (this.loginModel.invalid) return;
    this.err = '';
    this.auth.login(this.loginModel.value as any).subscribe({
      next: () => {
        this.authModalOpen = false;     // đóng modal
        this.menuOpen = false;
        this.router.navigateByUrl('/')
      },
      error: (e) => this.err = e?.error?.message || 'Đăng nhập thất bại'
    });
    this.authModalOpen = true;
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.router.navigateByUrl('/');
  }

  // Đóng dropdown khi bấm ra ngoài
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const t = ev.target as HTMLElement;
    if (!t.closest('.user-menu')) this.menuOpen = false;
  }

  submitRegister() {
    // TODO: gọi API đăng ký
    console.log('REGISTER', this.registerModel);
    this.closeAuth();
  }
}
