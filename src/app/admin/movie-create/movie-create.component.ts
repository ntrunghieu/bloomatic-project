import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MovieService, PhimRequestPayload, PhimDto } from '../../services/movie/movie.service'; // chỉnh lại path cho đúng
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';


interface GenreOption {
  maTheLoai: number;
  tenTheLoai: string;
}

export const dateGreaterThanTodayValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const dateValue = control.value; // Giá trị của FormControl (ngày)
    
    if (!dateValue) {
        return null; // Không có giá trị, bỏ qua kiểm tra (để Validators.required xử lý)
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Chuẩn hóa Today về 00:00:00

    const selectedDate = new Date(dateValue);
    selectedDate.setHours(0, 0, 0, 0); // Chuẩn hóa ngày được chọn

    // Nếu ngày được chọn < ngày hiện tại
    if (selectedDate < today) {
        // Trả về lỗi nếu ngày nhỏ hơn ngày hiện tại
        return { dateInPast: { message: 'Ngày khởi chiếu không được nhỏ hơn ngày hiện tại.' } };
    }

    return null; // Hợp lệ
};

@Component({
  selector: 'app-movie-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './movie-create.component.html',
  styleUrl: './movie-create.component.css'
})
export class MovieCreateComponent implements OnInit {
  movieForm!: FormGroup;
  posterPreview: string | null = null;
  posterFile: File | null = null;
  @ViewChild('fileInput') fileInput: any;
  private storage: Storage;

  isEditMode = false;
  movieId: number | null = null;

  // options cho các select
  // screenTypes = ['2D', '3D', 'IMAX', '4DX'];
  // translationTypes = ['Lồng tiếng', 'Phụ đề', 'Thuyết minh'];

  // map đúng với cột gioi_han_tuoi (VARCHAR(8))
  ageRatings = ['P', 'C13', 'C16', 'C18'];

  // map đúng với cột trang_thai trong bảng phim
  statuses = ['Sắp chiếu', 'Đang chiếu', 'Đã ngừng chiếu'];

  countries = ['Việt Nam', 'Mỹ', 'Hàn Quốc', 'Nhật Bản', 'Anh', 'Khác'];

  genreOptions: GenreOption[] = [];

  // genreOptions = [
  //   'Hành động',
  //   'Hài',
  //   'Kinh dị',
  //   'Tình cảm',
  //   'Khoa học - viễn tưởng',
  //   'Hoạt hình',
  //   'Phiêu lưu'
  // ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {
    this.storage = inject(Storage);
    this.movieForm = this.fb.group({
      name: ['', Validators.required],
      country: ['', Validators.required],
      duration: [null, [Validators.required, Validators.min(45)]],
      trailer: ['', Validators.required],
      description: ['', Validators.required],
      genres: [<number[]>[], Validators.required],
      directors: ['', Validators.required],
      actors: ['', Validators.required],
      // screenType: ['', Validators.required],
      // translationType: [''],
      ageRating: ['', Validators.required],
      initialDate: [null, [Validators.required, dateGreaterThanTodayValidator]],            
      endingDate: [''],
      status: ['Sắp chiếu', Validators.required],
      poster: [null],                  // lưu tên file/URL poster
    });

    this.setupAutoStatus();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.movieId = +idParam;
        this.loadMovieForEdit(this.movieId);
      }
    });

    this.movieService.getGenres().subscribe(list => {
      console.log('Dữ liệu genreOptions:', list);
      this.genreOptions = list.map(g => ({
        maTheLoai: g.maTheLoai,
        tenTheLoai: g.tenTheLoai
      }));
    });


  }

  /** Đăng ký lắng nghe khi user đổi ngày khởi chiếu / kết thúc */
  private setupAutoStatus(): void {
    this.movieForm.get('initialDate')?.valueChanges.subscribe(() => {
      this.updateStatusFromDates();
    });

    this.movieForm.get('endingDate')?.valueChanges.subscribe(() => {
      this.updateStatusFromDates();
    });
  }

  /** Tính trạng thái từ ngày và set vào form control 'status' */
  private updateStatusFromDates(): void {
    const initialDate = this.movieForm.get('initialDate')?.value;
    const endingDate = this.movieForm.get('endingDate')?.value;

    const status = this.calculateStatus(initialDate, endingDate);

    this.movieForm.get('status')?.setValue(status, { emitEvent: false });
  }

  /** Hàm tính trạng thái theo logic ngày */
  private calculateStatus(initialDate: string | null, endingDate: string | null): string {
    if (!initialDate && !endingDate) {
      return 'Sắp chiếu';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = initialDate ? new Date(initialDate) : null;
    const end = endingDate ? new Date(endingDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(0, 0, 0, 0);

    // start > today → Sắp chiếu
    if (start && start > today) {
      return 'Sắp chiếu';
    }

    // end < today → Đã chiếu
    if (end && end < today) {
      return 'Đã chiếu';
    }

    // start <= today và (end trống hoặc end >= today) → Đang chiếu
    if (start && start <= today && (!end || end >= today)) {
      return 'Đang chiếu';
    }

    // fallback
    return 'Sắp chiếu';
  }

  // Trong class ShowtimeSessionListComponent

  private isDateValidForFiltering(dateString: string): boolean {
    if (!dateString) return false;

    // Đặt ngày hôm nay về 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Chuyển ngày được chọn về đối tượng Date và đặt giờ về 00:00:00
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);

    // Kiểm tra: ngày được chọn >= ngày hiện tại
    return selectedDate >= today;
  }

  /** Gọi API lấy dữ liệu phim để patch vào form khi edit */
  loadMovieForEdit(id: number): void {

    this.movieService.getMovieById(id).subscribe({
      next: (movie: PhimDto) => {
        const selectedNames: string[] = movie.dsMaTheLoai ?? [];
        const selectedIds: number[] = this.genreOptions
          .filter(option => selectedNames.includes(option.tenTheLoai)) // 💡 So sánh tên
          .map(option => option.maTheLoai);

        this.movieForm.patchValue({
          name: movie.tenPhim,
          country: movie.quocGia ?? '',
          duration: movie.thoiLuong,
          trailer: movie.trailerUrl ?? '',
          description: movie.moTa ?? '',
          // genres: movie.dsMaTheLoai ?? [],
          genres: selectedIds,
          directors: movie.daoDien ?? '',
          actors: movie.dienVien ?? '',
          ageRating: movie.gioiHanTuoi ?? '',
          initialDate: movie.ngayKhoiChieu ?? '',
          endingDate: movie.ngayKetThuc ?? '',
          status: movie.trangThai,
          poster: movie.posterUrl ?? null
        });

        this.posterPreview = movie.posterUrl ?? null;
      },
      error: err => {
        console.error('Lỗi load phim:', err);
        alert('Không tải được thông tin phim');
      }
    });

    console.log('đây nè');
    console.log(this.movieForm);
  }

  onSubmit() {
    if (this.posterFile) {
      const filePath = `${Date.now()}_${this.posterFile.name}`;
      const storageRef = ref(this.storage, filePath); //ref đúng kiểu Storage

      uploadBytes(storageRef, this.posterFile).then(() => {
        return getDownloadURL(storageRef);
      }).then((url) => {
        this.movieForm.patchValue({ poster: url });
        // this.movieForm.poster = url;
        this._submitMovie();
        this.resetFileInput();
      }).catch((error) => {
        console.error('Upload thất bại', error);
        alert('Lỗi upload ảnh');
        this.resetFileInput();
      });
    } else {
      this._submitMovie();
      this.resetFileInput();
    }
  }

  /** Submit form: nếu edit thì update, không thì create */
  _submitMovie(): void {

    if (this.movieForm.invalid) {
      this.movieForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    console.log('payload');
    console.log(payload);



    if (this.isEditMode && this.movieId != null) {
      this.movieService.updateMovie(this.movieId, payload).subscribe({
        next: () => {
          alert('Cập nhật phim thành công');
          this.router.navigate(['/admin/movies/list']);
        },
        error: err => {
          console.error('Lỗi cập nhật phim:', err);
          alert('Cập nhật phim thất bại');
        }
      });
    } else {
      this.movieService.createMovie(payload).subscribe({
        next: () => {
          alert('Tạo phim thành công');
          this.router.navigate(['/admin/movies/list']);
        },
        error: err => {
          console.error('Lỗi tạo phim:', err);
          alert('Tạo phim thất bại');
        }
      });
    }
  }

  resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';  // Đặt lại giá trị của input file thành rỗng
    }
  }

  /** Map form -> payload gửi lên BE */
  private buildPayload(): PhimRequestPayload {
    const f = this.movieForm.value;
    const status = this.calculateStatus(f.initialDate, f.endingDate);
    const genreIds: number[] = f.genres || [];
    return {
      tenPhim: f.name,
      daoDien: f.directors,
      dienVien: f.actors,
      thoiLuong: Number(f.duration),
      quocGia: f.country || undefined,
      ngayKhoiChieu: f.initialDate || null,
      ngayKetThuc: f.endingDate || null,
      // tạm thời dùng tên file poster, sau này bạn upload Firebase rồi set URL thực sự
      posterUrl: f.poster || null,
      trailerUrl: f.trailer,
      moTa: f.description || undefined,
      trangThai: status,
      gioiHanTuoi: f.ageRating || null,
      dsMaTheLoai: genreIds.map(id => String(id)) as any
      // dsMaTheLoai: (f.genres || []) as number[]
      // createdAt: f.createdAtRaw
    };
  }

  /** Xóa phim ở chế độ edit */
  onDelete(): void {
    if (!this.isEditMode || this.movieId == null) {
      return;
    }

    const confirmDelete = confirm('Bạn có chắc muốn xóa phim này không?');
    if (!confirmDelete) return;

    this.movieService.deleteMovie(this.movieId).subscribe({
      next: () => {
        alert('Xóa phim thành công');
        this.router.navigate(['/admin/movies/list']);
      },
      error: err => {
        console.error('Lỗi xóa phim:', err);
        alert('Xóa phim thất bại');
      }
    });
  }

  /** Xử lý chọn file poster */
  onPosterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.posterFile = file;

    // lưu tên file vào form (tạm)
    this.movieForm.patchValue({ poster: file.name });

    // tạo preview
    const reader = new FileReader();
    reader.onload = () => {
      this.posterPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
