import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { I18nService } from '../../services/i18n/i18n.service';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    public i18n: I18nService,
    public themeService: ThemeService
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAValidUser;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDark;
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  navigate(path: string): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate([path]);
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  signOut(): void {
    this.authService.deleteSession();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
