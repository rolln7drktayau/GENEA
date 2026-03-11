import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '../../models/person.model';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { I18nService } from '../../services/i18n/i18n.service';

declare var observer: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  person: Person = new Person();
  isValidFormSubmitted: boolean | undefined;

  signInForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  signUpForm = this.formBuilder.group({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    if (typeof observer === 'function') {
      new observer();
    }
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  // Get Connected
  onSignIn(): void {
    this.isValidFormSubmitted = false;
    if (this.signInForm.invalid) {
      return;
    } else {
      this.isValidFormSubmitted = true;
      this.person.email = this.signInForm.get('email')?.value || '';
      this.person.password = this.signInForm.get('password')?.value || '';

      this.authService.checkPerson(this.person).subscribe(result => {
        if (result) {
          this.authService.setSession(result);
          this.router.navigate(['/home']);
        } else {
          alert(this.i18n.t('login.invalidCredentials'));
        }
      });
    }
  }

  // Get Registered
  onSignUp(): void {
    this.isValidFormSubmitted = false;
    if (this.signUpForm.invalid) {
      return;
    } else {
      this.isValidFormSubmitted = true;
    }

    this.person.firstname = this.signUpForm.get('name')?.value || '';
    this.person.email = this.signUpForm.get('email')?.value || '';
    this.person.password = this.signUpForm.get('password')?.value || '';
    this.person.role = 'USER';

    this.authService.checkPerson(this.person).subscribe(result => {
      if (result) {
        alert(this.i18n.t('login.userExists'));
      } else {
        this.authService.createPerson(this.person).subscribe(() => {
          alert(this.i18n.t('login.userCreated'));
          this.router.navigate(['/login']);
        });
      }
    });
  }

  get signUpName() {
    return this.signUpForm.get('name');
  }

  get signUpEmail() {
    return this.signUpForm.get('email');
  }

  get signUpPassword() {
    return this.signUpForm.get('password');
  }

  get signInEmail() {
    return this.signInForm.get('email');
  }

  get sigInPassword() {
    return this.signInForm.get('password');
  }
}
