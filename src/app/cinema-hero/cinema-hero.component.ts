import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';


@Component({
  selector: 'app-cinema-hero',
  standalone: true,
  imports: [CommonModule,RouterLink, RouterModule],
  templateUrl: './cinema-hero.component.html',
  styleUrls: ['./cinema-hero.component.css']
})
export class CinemaHeroComponent {
  imgUrl = 'assets/img/momo-hero.png';
}
