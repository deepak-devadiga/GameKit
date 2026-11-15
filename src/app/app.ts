import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfigService } from './core/services/config.service';
import { StorageAuthService } from './core/services/storage-auth.service';
import { ThemeService } from './core/services/theme.service';
import { SoundService } from './core/services/sound.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('GameKit');
  protected readonly currentYear = new Date().getFullYear();
  protected readonly mobileMenuOpen = signal(false);

  protected readonly configService = inject(ConfigService);
  protected readonly authStorage = inject(StorageAuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly soundService = inject(SoundService);

  protected readonly menus = this.configService.menus;
  protected readonly totalHighScore = this.authStorage.totalHighScore;
  protected readonly gamesPlayedCount = this.authStorage.gamesPlayedCount;

  toggleTheme(): void {
    this.soundService.play('click');
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.soundService.play('click');
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    if (this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
    }
  }
}
