import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  loading = false;
  error: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { email, password } = this.form.value;

    console.log(email);

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        // Nếu muốn chỉ admin mới vào trang admin:
        if (this.auth.isAdmin) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          // không phải admin thì cho ra trang user thường chẳng hạn
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Đăng nhập thất bại';
      }
    });
  }
}
