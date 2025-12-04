import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.css'
})
export class LeftSidebarComponent {
  openGroup: string | null = 'movies';
  openGroupOverall: string | null = 'movies';
  openGroupSchedule: string | null = 'schedule';
  openGroupShowTime: string | null = 'showtime';
  openGroupTheater: string | null = 'theater';
  openGroupTicket: string | null = 'ticket';
  openGroupOrders: string | null = 'orders';

  activeView: string = 'dashboard';

  // ==== USER DROPDOWN ====
  adminName = '';
  userMenuOpen = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.adminName = this.auth.fullName || 'Admin';
  }

  get userInitials(): string {
    if (!this.adminName) return 'A';
    const parts = this.adminName.trim().split(/\s+/);
    const letters = parts.map(p => p[0]).join('').substring(0, 2);
    return letters.toUpperCase();
  }

  toggleGroup(group: string) {
    this.openGroup = this.openGroup === group ? null : group;
  }
  toggleGroupSchedule(group: string) {
    this.openGroupSchedule = this.openGroupSchedule === group ? null : group;
  }
  toggleGroupShowTime(group: string) {
    this.openGroupShowTime = this.openGroupShowTime === group ? null : group;
  }
  toggleGroupOverall(group: string) {
    this.openGroupOverall = this.openGroupOverall === group ? null : group;
  }
  toggleGroupTheater(group: string) {
    this.openGroupTheater = this.openGroupTheater === group ? null : group;
  }
  toggleGroupTicket(group: string) {
    this.openGroupTicket = this.openGroupTicket === group ? null : group;
  }
  toggleGroupOrders(group: string) {
    this.openGroupOrders = this.openGroupOrders === group ? null : group;
  }

  // === user menu ===
  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();           // ngăn bubble lên document
    this.userMenuOpen = !this.userMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // nếu click nằm ngoài sidebar-user thì mới đóng menu
    if (!this.elementRef.nativeElement
      .querySelector('.sidebar-user')
      ?.contains(target)) {
      this.userMenuOpen = false;
    }
  }
  
  closeUserMenuWhenClickOutside() {
    this.userMenuOpen = false;
  }

  goProfile() {
    this.userMenuOpen = false;
    this.router.navigate(['/admin/profile']);
  }

  goAccountSettings() {
    this.userMenuOpen = false;
    this.router.navigate(['/admin/account-settings']);
  }

  onLogout() {
    this.userMenuOpen = false;
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

}
