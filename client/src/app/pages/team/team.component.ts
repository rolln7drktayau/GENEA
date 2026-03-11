import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit {

  team: any[] = [];

  constructor(private authService: AuthService) {
    this.authService = authService;
  }

  ngOnInit() {
    this.authService.getTeam().subscribe((team) => {
      this.team = team;
    });
  }
}
