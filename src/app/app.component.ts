import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NgIf, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent{
  title = 'FRONTEND';
  isAdminRoute = false;

  private router = inject(Router);
  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        // tất cả route admin đều bắt đầu bằng /admin
        this.isAdminRoute = e.urlAfterRedirects.startsWith('/admin');
      });
  }
}
// export class AppComponent implements AfterViewInit, OnDestroy{
//   @ViewChild('track', { static: true }) track!: ElementRef<HTMLDivElement>;
//   @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLDivElement>;

//   constructor(private sanitizer: DomSanitizer) {}

//   autoplayMs = 4000;           // 4 giây
//   private timer?: any;

//   movies: Movie[] = [
//     {
//       id: 1,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     },
//     {
//       id: 2,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     },
//     {
//       id: 3,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     },
//     {
//       id: 4,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     },
//     {
//       id: 5,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     },
//     {
//       id: 6,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     },
//     {
//       id: 7,
//       title: 'Cục Vàng Của Ngoại',
//       poster: 'https://cdna.artstation.com/p/assets/images/images/074/294/018/large/xem-phim-mai-2024-1080-full-vietsub-8292458-bbbbbbbbbbaaaaaaaavvv.jpg?1711702817',
//       age: '13+',
//       dayNo: 21,
//       genres: ['Chính Kịch','Gia Đình','Tâm Lý'],
//       rating: 8.9,
//       release: '17.10.2025',
//       description:
//         'Phim xoay quanh mối quan hệ 3 thế hệ: Bà – Mẹ – Cháu, khai thác sâu tình cảm bà – cháu nhằm tôn vinh giá trị cao đẹp...',
//       trailerId: 'dQw4w9WgXcQ',
      
//     }
//   ];

//   // ===== Carousel controls =====
//   ngAfterViewInit(): void { this.start(); }
//   ngOnDestroy(): void { this.stop(); }
//   next() {
//     const cs = getComputedStyle(this.viewport.nativeElement);
//     const vpwVar = cs.getPropertyValue('--vpw');
//     const amount = vpwVar ? parseFloat(vpwVar) : this.viewport.nativeElement.clientWidth;
//     this.viewport.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
//     this.reset();
//   }
//   prev() {
//     const cs = getComputedStyle(this.viewport.nativeElement);
//     const vpwVar = cs.getPropertyValue('--vpw');
//     const amount = vpwVar ? parseFloat(vpwVar) : this.viewport.nativeElement.clientWidth;
//     this.viewport.nativeElement.scrollBy({ left: -amount, behavior: 'smooth' });
//     this.reset();
//   }
//   start() { if (!this.timer) this.timer = setInterval(() => this.next(), this.autoplayMs); }
//   stop() { if (this.timer) { clearInterval(this.timer); this.timer = undefined; } }
//   reset() { this.stop(); this.start(); }

//     // ===== Trailer Modal =====
//   modalOpen = false;
//   active?: Movie;
//   safeSrc?: SafeResourceUrl;

//   openTrailer(m: Movie) {
//     this.active = m;
//     this.setVideo(m.trailerId);
//     this.modalOpen = true;
//     this.stop(); // tạm dừng auto-slide khi mở modal
//     document.body.style.overflow = 'hidden'; // khoá scroll nền
//   }

//   closeTrailer() {
//     this.modalOpen = false;
//     this.active = undefined;
//     this.safeSrc = undefined; // ngắt nguồn để dừng video
//     document.body.style.overflow = '';
//     this.start();
//   }

//   setVideo(youtubeId: string) {
//     const url = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
//     this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
//   }

//   @HostListener('document:keydown.escape') onEsc() {
//     if (this.modalOpen) this.closeTrailer();
//   }

//   title = 'QuickCinemaProject';


//   pause() { this.stopAutoplay(); }
//   resume() { this.startAutoplay(); }

//   private startAutoplay() {
//     if (this.timer) return;
//     this.timer = setInterval(() => this.next(), this.autoplayMs);
//   }
//   private stopAutoplay() {
//     if (!this.timer) return;
//     clearInterval(this.timer);
//     this.timer = undefined;
//   }
//   private resetAutoplay() {
//     this.stopAutoplay();
//     this.startAutoplay();
//   }
// }

