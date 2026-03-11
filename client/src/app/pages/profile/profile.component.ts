import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth/auth.service';
import { Person } from '../../models/person.model';
import { I18nService } from '../../services/i18n/i18n.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  readonly form = this.formBuilder.group({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  submitted = false;
  feedback = '';
  isError = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public i18n: I18nService
  ) {}

  controlInvalid(controlName: 'oldPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && this.submitted;
  }

  get passwordsMatch(): boolean {
    const next = this.form.get('newPassword')?.value || '';
    const confirm = this.form.get('confirmPassword')?.value || '';
    return next === confirm;
  }

  get oldPasswordMatches(): boolean {
    const oldPassword = this.form.get('oldPassword')?.value || '';
    const user = sessionStorage.getItem('User');
    if (!user) {
      return false;
    }

    const parsedUser = JSON.parse(user);
    return oldPassword === (parsedUser.password || '');
  }

  onSubmit(): void {
    this.submitted = true;
    this.feedback = '';
    this.isError = false;

    if (this.form.invalid) {
      return;
    }

    if (!this.oldPasswordMatches) {
      this.setFeedback(this.i18n.t('profile.oldPasswordInvalid'), true);
      return;
    }

    if (!this.passwordsMatch) {
      this.setFeedback(this.i18n.t('profile.passwordMismatch'), true);
      return;
    }

    const userRaw = sessionStorage.getItem('User');
    if (!userRaw) {
      this.setFeedback(this.i18n.t('profile.userMissing'), true);
      return;
    }

    const toUpdate: Person = JSON.parse(userRaw);
    const newPassword = this.form.get('confirmPassword')?.value || '';
    toUpdate.password = newPassword;

    this.authService.updateDb(toUpdate).subscribe({
      next: (updatedUser) => {
        this.authService.setSession(updatedUser);
        this.setFeedback(this.i18n.t('profile.updated'));
        this.router.navigate(['/home']);
      },
      error: () => {
        this.setFeedback(this.i18n.t('profile.updateError'), true);
      }
    });
  }

  private setFeedback(message: string, isError = false): void {
    this.feedback = message;
    this.isError = isError;
  }
}
