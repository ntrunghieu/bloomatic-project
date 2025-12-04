import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CinemaService, TaoRapRequest } from '../../services/cinema/cinema.service';

@Component({
  selector: 'app-cinema-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cinema-create.component.html',
  styleUrls: ['./cinema-create.component.css'],
})
export class CinemaCreateComponent {
  form: FormGroup;
  loading = false;

  // modal thông báo
  notifyOpen = false;
  notifyTitle = '';
  notifyMessage = '';
  private notifyAfterClose?: () => void;

  constructor(private fb: FormBuilder, private router: Router, private cinemaService: CinemaService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(160)]],
      address: ['', [Validators.required]],
      // mapAddress: [''],
    });
  }

  goBack() {
    this.router.navigate(['/admin/cinemas']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.value;

    // map sang body tiếng Việt của BE
    const payload: TaoRapRequest = {
      tenRap: (f.name || '').trim(),
      diaChi: (f.address || '').trim(),
      // dienThoai: null, 
      // email: null,
    };

    this.loading = true;

    this.cinemaService.taoRap(payload).subscribe({
      next: (rap) => {
        console.log('Đã tạo rạp:', rap);
        this.loading = false;
        this.openNotify(
          'Tạo rạp chiếu thành công',
          `Đã tạo rạp "${rap.tenRap}".`,
          () => this.router.navigate(['/admin/cinemas/list'])
        );
        // quay lại danh sách rạp
        this.router.navigate(['/admin/cinemas/list']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Lỗi tạo rạp:', err);
        alert('Tạo rạp chiếu thất bại. Vui lòng thử lại.');
      },
    });
  }

  openNotify(title: string, message: string, afterClose?: () => void) {
    this.notifyTitle = title;
    this.notifyMessage = message;
    this.notifyAfterClose = afterClose;
    this.notifyOpen = true;
  }

  closeNotify() {
    this.notifyOpen = false;
    if (this.notifyAfterClose) {
      const fn = this.notifyAfterClose;
      this.notifyAfterClose = undefined;
      fn();
    }
  }
}
