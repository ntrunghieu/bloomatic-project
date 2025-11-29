import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-password.component.html',
  styleUrl: './account-password.component.css'
})
export class AccountPasswordComponent implements OnInit {
  f!: FormGroup;
  showOld = false; showNew = false; showCf = false;
  msg = '';

  constructor(private fb: FormBuilder, private api: AccountService) { }
  ngOnInit(): void {
    this.f = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    const { oldPassword, newPassword, confirmPassword } = this.f.value;
    if (newPassword !== confirmPassword) { this.msg = 'Mật khẩu xác nhận không khớp'; return; }
    this.api.changePassword({ oldPassword: oldPassword!, newPassword: newPassword! })
      .subscribe(() => this.msg = 'Đã đổi mật khẩu!');
  }
}
