import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cinema-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cinema-create.component.html',
  styleUrls: ['./cinema-create.component.css'],
})
export class CinemaCreateComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
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

    const payload = this.form.value;
    console.log('Create cinema payload', payload);

    // TODO: gọi API tạo rạp chiếu
    // this.cinemaService.create(payload).subscribe(...)

    // Demo: quay lại danh sách
    this.router.navigate(['/admin/cinemas']);
  }
}
