import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.css'
})
export class AccountProfileComponent implements OnInit {

  f!: FormGroup;
  initials = 'U';
  msg = '';

  constructor(private fb: FormBuilder, private api: AccountService, private auth: AuthService,) { }

  ngOnInit() {
    this.f = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      email: [{ value: '', disabled: false }]
    });

    this.api.getProfile().subscribe(p => {
      this.f.patchValue(p as any);
      this.initials = (p.fullName || p.email).split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
    });

    const raw = localStorage.getItem('auth');
    if (raw) {
      try {
        const u = JSON.parse(raw) as { fullName?: string; email: string; phone?: string };
        this.f.patchValue({
          fullName: u.fullName || '',
          phone: u.phone || '',
          email: u.email || ''
        });
        this.initials = this.makeInitials(u.fullName || u.email);
      } catch { /* bỏ qua lỗi parse */ }
  }

   // 2) (TUỲ CHỌN) cập nhật lại từ API để đồng bộ dữ liệu mới nhất
    this.api.getProfile().subscribe(p => {
      this.f.patchValue({
        fullName: p.fullName || '',
        phone: p.phone || '',
        email: p.email || ''
      });
      this.initials = this.makeInitials(p.fullName || p.email);
    });
  }

  submit() {
    const { fullName, phone } = this.f.getRawValue();
    this.api.updateProfile({ fullName: fullName!, phone: phone || '' })
      .subscribe(() => this.msg = 'Đã lưu!');
  }

  private makeInitials(s: string) {
    return s.trim().split(/\s+/).map(x => x[0]).join('').slice(0,2).toUpperCase();
  }
}
