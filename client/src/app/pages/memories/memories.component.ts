import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from "../../services/auth/auth.service";
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-memories',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],
  templateUrl: './memories.component.html',
  styleUrl: './memories.component.css'
})
export class MemoriesComponent implements OnInit {

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log(file);

    let id = sessionStorage.getItem('UserId');
    if (id != null) {
      this.authService.getPersonById(id).subscribe(result => {
        let reader = new FileReader();
        reader.onload = () => {
          let personToUpdate: Person = result;
          personToUpdate.mem.push(reader.result);
          this.authService.updateDb(personToUpdate).subscribe(result => {
            console.log('Update Database', result);
          })
          console.log(reader);
          console.warn('WARN : ', personToUpdate);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
