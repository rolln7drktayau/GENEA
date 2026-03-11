import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'GeneaThemeMode';
  private readonly theme$ = new BehaviorSubject<ThemeMode>('light');

  readonly mode$ = this.theme$.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const mode = this.readStoredTheme();
    this.setTheme(mode);
  }

  get currentMode(): ThemeMode {
    return this.theme$.value;
  }

  get isDark(): boolean {
    return this.currentMode === 'dark';
  }

  toggleTheme(): ThemeMode {
    const next: ThemeMode = this.isDark ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  setTheme(mode: ThemeMode): void {
    this.theme$.next(mode);
    localStorage.setItem(this.storageKey, mode);
    this.document.documentElement.setAttribute('data-theme', mode);
    this.document.body.setAttribute('data-theme', mode);
  }

  private readStoredTheme(): ThemeMode {
    const stored = localStorage.getItem(this.storageKey);
    return stored === 'dark' ? 'dark' : 'light';
  }
}
