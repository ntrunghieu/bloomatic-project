import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-movie-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './movie-create.component.html',
  styleUrl: './movie-create.component.css'
})
export class MovieCreateComponent {
  movieForm: FormGroup;
  posterPreview: string | null = null;   // để hiển thị ảnh
  posterFile: File | null = null;        // để gửi lên backend sau này

   // chế độ
  isEditMode = false;
  movieId: number | null = null;

  // options cho các select
  screenTypes = ['2D', '3D', 'IMAX', '4DX'];
  translationTypes = ['Lồng tiếng', 'Phụ đề', 'Thuyết minh'];
  ageRatings = ['P - Mọi lứa tuổi', 'C13', 'C16', 'C18'];
  statuses = ['Nháp', 'Công khai', 'Ẩn'];
  countries = ['Việt Nam', 'Mỹ', 'Hàn Quốc', 'Nhật Bản', 'Anh', 'Khác'];
  genreOptions = [
    'Hành động',
    'Hài',
    'Kinh dị',
    'Tình cảm',
    'Khoa học - viễn tưởng',
    'Hoạt hình',
    'Phiêu lưu'
  ];

  // directors = ['Đạo diễn 1', 'Đạo diễn 2'];
  // actors = ['Diễn viên 1', 'Diễn viên 2'];

  constructor(private fb: FormBuilder, private route: ActivatedRoute ) {
    this.movieForm = this.fb.group({
      name: ['', Validators.required],
      englishName: [''],
      trailer: ['', Validators.required],
      description: [''],
      genres: [[]],
      directors: ['', Validators.required],
      actors: ['', Validators.required],
      // directors: [[]],
      // actors: [[]],

      screenType: ['', Validators.required],
      translationType: [''],
      ageRating: [''],
      showDate: [''],
      releaseYear: [''],
      duration: [''],
      status: ['Nháp'],
      country: [''],
      poster: [null],
    });
  }

  ngOnInit(): void {
    // nếu URL có :id -> chuyển sang chế độ edit
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.movieId = +idParam;
        this.loadMovieForEdit(this.movieId);
      }
    });
  }

  // Tạm mock dữ liệu để demo. Sau này bạn đổi sang gọi API.
  loadMovieForEdit(id: number) {
    console.log('Load movie for edit id =', id);

    // Ví dụ data demo cho id = 1
    const mock = {
      name: 'Furiosa: Câu Chuyện Từ Max Điên',
      englishName: 'Furiosa: A Mad Max Saga',
      trailer: 'https://www.youtube.com/watch?v=xxxx',
      description: 'Câu chuyện bắt đầu từ lúc Thế giới Sụp đổ...',
      genres: ['Hành động', 'Khoa học - viễn tưởng'],
      directors: 'Anya Taylor-Joy',
      actors: 'Chris Hemsworth, Tom Burke',
      screenType: '2D',
      translationType: 'Phụ đề',
      ageRating: 'C16',
      showDate: '2025-05-17',  // yyyy-MM-dd
      releaseYear: 2024,
      duration: 100,
      status: 'Công khai',
      country: 'Mỹ',
      // poster: null
    };

    this.movieForm.patchValue(mock);
    // Nếu muốn có preview poster demo thì set posterPreview = 'link-ảnh';
  }

  onSubmit() {
    if (this.movieForm.invalid) {
      this.movieForm.markAllAsTouched();
      return;
    }
    console.log('Movie payload:');
    console.log('Movie payload:', this.movieForm.value);
    // TODO: call API tạo phim
  }

  onPosterChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.posterFile = file;

    // lưu tên file vào form (optional)
    this.movieForm.patchValue({ poster: file.name });

    // tạo preview
    const reader = new FileReader();
    reader.onload = () => {
      this.posterPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
