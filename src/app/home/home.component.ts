import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common'; 
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AfterViewInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { CinemaHeroComponent } from '../cinema-hero/cinema-hero.component';
import { FooterComponent } from '../footer/footer.component';
import { TaglineComponent } from '../tagline/tagline.component';
import { ScheduleComponent } from '../schedule/schedule.component';
import { MovieListComponent } from "../movie-list/movie-list.component";
import { HomeMovie, MovieService } from '../services/movie/movie.service';


type TrailerThumb = { id: string; thumb: string; title?: string };
type Movie = {
  id: number;
  title: string;
  poster: string;
  age: string;
  dayNo: number;
  genres: string[];
  release: string;
  description: string;
  trailerId: string;        // YouTube video id
  moreTrailers?: TrailerThumb[];
};


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, CinemaHeroComponent, TaglineComponent, MovieListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy{
@ViewChild('track', { static: true }) track!: ElementRef<HTMLDivElement>;
@ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLDivElement>;

  constructor(private sanitizer: DomSanitizer, private movieService: MovieService) {}

  autoplayMs = 4000;           // 4 giây
  private timer?: any;

    // MỚI: tách 2 mảng
  nowShowingMovies: HomeMovie[] = [];
  comingSoonMovies: HomeMovie[] = [];

  movies: Movie[] = [
    {
      id: 1,
      title: 'Cục Vàng Của Ngoại',
      poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
      age: '13+',
      dayNo: 21,
      genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
      // rating: 8.9,
      release: '17.10.2025',
      description:
        'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
      trailerId: 'dQw4w9WgXcQ',
      
    }
  ];

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.loadMovies();
  }

  ngAfterViewInit(): void {
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private loadMovies(): void {
    // Phim đang chiếu
    this.movieService.getNowShowing().subscribe({
      next: data => (this.nowShowingMovies = data),
      error: err => console.error('Lỗi lấy phim đang chiếu', err),
    });

    // Phim sắp chiếu
    this.movieService.getComingSoon().subscribe({
      next: data => (this.comingSoonMovies = data),
      error: err => console.error('Lỗi lấy phim sắp chiếu', err),
    });
  }
  // ===== Carousel controls =====
  next() {
    const el = this.viewport?.nativeElement;
    if (!el) return;
    const cs = getComputedStyle(el);
    const vpwVar = cs.getPropertyValue('--vpw')?.trim() || '';
    // try to extract a pixel value (e.g. "1100px") or a plain number; otherwise fall back to clientWidth
    let amount = el.clientWidth;
    if (vpwVar) {
      const m = vpwVar.match(/(-?[0-9]+\.?[0-9]*)px/);
      if (m) amount = parseFloat(m[1]);
      else {
        const n = parseFloat(vpwVar);
        if (!isNaN(n)) amount = n;
      }
    }
    el.scrollBy({ left: amount, behavior: 'smooth' });
    this.reset();
  }
  prev() {
    const el = this.viewport?.nativeElement;
    if (!el) return;
    const cs = getComputedStyle(el);
    const vpwVar = cs.getPropertyValue('--vpw')?.trim() || '';
    let amount = el.clientWidth;
    if (vpwVar) {
      const m = vpwVar.match(/(-?[0-9]+\.?[0-9]*)px/);
      if (m) amount = parseFloat(m[1]);
      else {
        const n = parseFloat(vpwVar);
        if (!isNaN(n)) amount = n;
      }
    }
    el.scrollBy({ left: -amount, behavior: 'smooth' });
    this.reset();
  }
  start() { if (!this.timer) this.timer = setInterval(() => this.next(), this.autoplayMs); }
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = undefined; } }
  reset() { this.stop(); this.start(); }

    // ===== Trailer Modal =====
  modalOpen = false;
  modalOpenSapChieu = false;
  active?: Movie;
  safeSrc?: SafeResourceUrl;

  openTrailer(m: Movie) {
    this.active = m;
    this.setVideo(m.trailerId);
    this.modalOpen = true;
    this.stop(); // tạm dừng auto-slide khi mở modal
    document.body.style.overflow = 'hidden'; // khoá scroll nền
  }

  openTrailerSC(m: Movie) {
    this.active = m;
    this.setVideo(m.trailerId);
    this.modalOpenSapChieu = true;
    this.stop(); // tạm dừng auto-slide khi mở modal
    document.body.style.overflow = 'hidden'; // khoá scroll nền
  }

  closeTrailer() {
    this.modalOpen = false;
    this.active = undefined;
    this.safeSrc = undefined; // ngắt nguồn để dừng video
    document.body.style.overflow = '';
    this.start();
  }

  closeTrailerSC() {
    this.modalOpenSapChieu = false;
    this.active = undefined;
    this.safeSrc = undefined; // ngắt nguồn để dừng video
    document.body.style.overflow = '';
    this.start();
  }

  setVideo(youtubeId: string) {
    const url = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  @HostListener('document:keydown.escape') onEsc() {
    if (this.modalOpen) this.closeTrailer();
  }

  title = 'QuickCinemaProject';


  pause() { this.stopAutoplay(); }
  resume() { this.startAutoplay(); }

  private startAutoplay() {
    if (this.timer) return;
    this.timer = setInterval(() => this.next(), this.autoplayMs);
  }
  private stopAutoplay() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }
  private resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
}
