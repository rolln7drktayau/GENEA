import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { I18nService } from '../../services/i18n/i18n.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  get isAuthenticated(): boolean {
    return this.authService.isAValidUser;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  navigate(path: string) {
    if (this.isAuthenticated) {
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleTheme() {
    // Implement your theme toggle logic here
    console.log("Theme changed");
    this.themeService.setDarkTheme(false);
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  signOut() {
    this.authService.deleteSession();
    this.router.navigate(['/login']);
  }
}
