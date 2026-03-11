import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth/auth.service';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],

  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  form = this.formBuilder.group({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  isValidFormSubmitted: boolean | undefined;
  notTheSame: boolean | undefined;
  oldPassword: string | undefined;
  newPassword: string | undefined;
  confirmPassword: string | undefined;
  sessionPassword: string | undefined;

  toUpdate: any;

  constructor(private formBuilder: FormBuilder, private router: Router, private authService: AuthService) {
  }

  checkPasswords(group: FormGroup) {
    let newPassword = group.get('newPassword')?.value;
    let confirmPassword = group.get('confirmPassword')?.value;
    if (newPassword === confirmPassword) {
      this.notTheSame = false;
    }
    return newPassword === confirmPassword ? null : { notSame: true };
  }

  isPasswordCorrect(group: FormGroup) {
    let oldPassword = group.get('oldPassword')?.value;
    return oldPassword === this.sessionPassword;
  }

  onSubmit() {
    this.isValidFormSubmitted = false;
    this.oldPassword = this.form.get('oldPassword')?.value || '';
    this.newPassword = this.form.get('newPassword')?.value || '';
    this.confirmPassword = this.form.get('confirmPassword')?.value || '';
    let user = sessionStorage.getItem('User');
    if (user != null) {
      this.sessionPassword = JSON.parse(user).password;
      console.log('Session password ', this.sessionPassword);
    }

    if (this.form.valid && (this.newPassword === this.confirmPassword) && (this.oldPassword === this.sessionPassword)) {
      // Here you can add the code to actually update the password

      if (user != null) {
        this.toUpdate = JSON.parse(user);
        this.toUpdate.password = this.confirmPassword;
        this.authService.updateDb(this.toUpdate).subscribe(data => {
          console.log('User updated :', data);
          this.router.navigate(['/home']);
        });
      }
      console.log(this.form.value);
    } else {
      return;
    }
  }
}
