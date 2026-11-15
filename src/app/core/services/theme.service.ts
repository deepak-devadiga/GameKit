import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { ThemeMode } from '../models/gamekit.models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly currentTheme = signal<ThemeMode>(this.loadInitialTheme());

  constructor() {
    effect(() => {
      const mode = this.currentTheme();
      this.doc.documentElement.setAttribute('data-theme', mode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gk_v22_theme', mode);
      }
    });
  }

  private loadInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('gk_v22_theme') as ThemeMode | null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  }

  toggleTheme(): void {
    this.currentTheme.update((curr) => (curr === 'dark' ? 'light' : 'dark'));
  }
}
