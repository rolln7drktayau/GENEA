import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Person } from '../../models/person.model';
import { AuthService } from '../../services/auth/auth.service';
import { I18nService } from '../../services/i18n/i18n.service';

type AuthMode = 'signin' | 'signup' | 'reset';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  mode: AuthMode = 'signin';
  feedback = '';
  isError = false;

  readonly signInForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  readonly signUpForm = this.formBuilder.group({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  readonly resetForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  get isSignUpMode(): boolean {
    return this.mode === 'signup';
  }

  get isResetMode(): boolean {
    return this.mode === 'reset';
  }

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.feedback = '';
    this.isError = false;
  }

  switchMode(): void {
    this.setMode(this.isSignUpMode ? 'signin' : 'signup');
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  onSignIn(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const payload = new Person();
    payload.email = this.signInForm.get('email')?.value || '';
    payload.password = this.signInForm.get('password')?.value || '';

    this.authService.checkPerson(payload).subscribe({
      next: (result) => {
        if (!result) {
          this.setFeedback(this.i18n.t('login.invalidCredentials'), true);
          return;
        }
        this.authService.setSession(result);
        this.router.navigate(['/home']);
      },
      error: () => this.setFeedback(this.i18n.t('login.invalidCredentials'), true)
    });
  }

  onSignUp(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const email = this.signUpForm.get('email')?.value || '';
    const checkPayload = new Person();
    checkPayload.email = email;

    this.authService.getPersonByEmail(checkPayload).subscribe({
      next: (existingUser) => {
        if (existingUser) {
          this.setFeedback(this.i18n.t('login.userExists'), true);
          return;
        }

        const user = new Person();
        user.firstname = this.signUpForm.get('name')?.value || '';
        user.lastname = 'Member';
        user.name = `${user.firstname} ${user.lastname}`;
        user.email = email;
        user.password = this.signUpForm.get('password')?.value || '';
        user.role = 'USER';
        user.status = 'Member';

        this.authService.createPerson(user).subscribe({
          next: () => {
            this.setFeedback(this.i18n.t('login.userCreated'));
            this.setMode('signin');
          },
          error: () => this.setFeedback(this.i18n.t('login.userExists'), true)
        });
      },
      error: () => this.setFeedback(this.i18n.t('login.userExists'), true)
    });
  }

  onResetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const newPassword = this.resetForm.get('newPassword')?.value || '';
    const confirmPassword = this.resetForm.get('confirmPassword')?.value || '';
    if (newPassword !== confirmPassword) {
      this.setFeedback(this.i18n.t('login.passwordMismatch'), true);
      return;
    }

    const email = this.resetForm.get('email')?.value || '';
    this.authService.resetPassword(email, newPassword).subscribe({
      next: () => {
        this.setFeedback(this.i18n.t('login.resetSuccess'));
        this.setMode('signin');
      },
      error: () => this.setFeedback(this.i18n.t('login.resetError'), true)
    });
  }

  controlInvalid(formName: 'signInForm' | 'signUpForm' | 'resetForm', controlName: string): boolean {
    const form = this[formName] as { get(path: string): AbstractControl | null };
    const control = form.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  private setFeedback(message: string, isError = false): void {
    this.feedback = message;
    this.isError = isError;
  }
}
