import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink, RouterOutlet } from "@angular/router";
import { NavbarComponent } from "../navbar/navbar.component";
import { Stats } from "../../models/stats.model";
import { I18nService } from "../../services/i18n/i18n.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  userName = 'Member';
  title = 'GENEA';
  stats: Stats = new Stats(0, 0, 0, 0);

  constructor(public i18n: I18nService) {}

  ngOnInit(): void {
    this.userName = sessionStorage.getItem('UserFirstName') || 'Member';

    let stats = sessionStorage.getItem('Stats');
    if (stats != null) {
      this.stats = JSON.parse(stats);
    }
  }

}
