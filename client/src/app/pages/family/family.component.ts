import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink, RouterOutlet } from "@angular/router";
import { NavbarComponent } from "../navbar/navbar.component";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],
  templateUrl: './family.component.html',
  styleUrl: './family.component.css'
})
export class FamilyComponent implements OnInit {

  persons: any[] = [];

  constructor(private authService: AuthService) {
    this.authService = authService;
  }

  ngOnInit() {
    let id = sessionStorage.getItem('UserId');
    if (id != null) {
      this.authService.getFamily(id).subscribe(persons => {
        this.persons = persons;
      });
    }
  }
}
