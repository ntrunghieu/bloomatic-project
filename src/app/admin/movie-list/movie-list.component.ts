import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent {

  page = 1;        // trang hiện tại
  pageSize = 3;   // số dòng / trang
  pages: number[] = [];

  movies = [
    {
      id: 1,
      name: 'Furiosa: Câu Chuyện Từ Max Điên',
      releaseYear: 2024,
      genres: ['Khoa học - viễn tưởng', 'Hành động'],
      showDate: '17-05-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    },
    {
      id: 2,
      name: 'Lật Mặt 7: Một Điều Ước',
      releaseYear: 2024,
      genres: ['Tâm lý', 'Tình cảm'],
      showDate: '26-04-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    },
    {
      id: 3,
      name: 'Lật Mặt 7: Một Điều Ước',
      releaseYear: 2024,
      genres: ['Tâm lý', 'Tình cảm'],
      showDate: '26-04-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    },
    {
      id: 4,
      name: 'Lật Mặt 7: Một Điều Ước',
      releaseYear: 2024,
      genres: ['Tâm lý', 'Tình cảm'],
      showDate: '26-04-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    },
    {
      id: 5,
      name: 'Lật Mặt 7: Một Điều Ước',
      releaseYear: 2024,
      genres: ['Tâm lý', 'Tình cảm'],
      showDate: '26-04-2024',
      status: 'Công khai',
      createdDate: '13-04-2024'
    }
  ];

  ngOnInit() {
    // nếu movies là mock sẵn thì gọi luôn, nếu load API thì gọi sau khi có data
    this.updatePages();
  }

  get pagedMovies() {
    const start = (this.page - 1) * this.pageSize;
    return this.movies.slice(start, start + this.pageSize);
  }

  updatePages() {
    const totalPages = Math.ceil(this.movies.length / this.pageSize);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.pages.length) return;
    this.page = p;
  }

  prevPage() {
    this.goToPage(this.page - 1);
  }

  nextPage() {
    this.goToPage(this.page + 1);
  }

  onRefresh() {
    // TODO: gọi API load lại danh sách
    console.log('Refresh movie list');
  }
}
