import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from './theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'Genea';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Force theme service initialization at app bootstrap.
    this.themeService.setTheme(this.themeService.currentMode);
  }
}
