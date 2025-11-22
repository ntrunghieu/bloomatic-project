import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.css'
})
export class LeftSidebarComponent {
  openGroup: string | null = 'movies';
  openGroupOverall: string | null = 'movies';
  openGroupSchedule: string | null = 'schedule';
  openGroupTheater: string | null = 'theater';
  activeView: string = 'dashboard';

  toggleGroup(group: string) {
    this.openGroup = this.openGroup === group ? null : group;
  }
  toggleGroupSchedule(group: string) {
    this.openGroupSchedule = this.openGroupSchedule === group ? null : group;
  }
  toggleGroupOverall(group: string) {
    this.openGroupOverall = this.openGroupOverall === group ? null : group;
  }
  toggleGroupTheater(group: string) {
    this.openGroupTheater = this.openGroupTheater === group ? null : group;
  }
}
