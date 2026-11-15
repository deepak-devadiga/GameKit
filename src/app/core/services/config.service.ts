import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig, GameCategory, GameDefinition, MenuConfig } from '../models/gamekit.models';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);

  readonly appConfig = signal<AppConfig | null>(null);

  readonly menuResource = httpResource<MenuConfig>(() => 'config/menus.json');
  readonly gamesResource = httpResource<GameDefinition[]>(() => 'config/games.json', {
    defaultValue: [],
  });

  readonly menus = computed(() =>
    this.menuResource.hasValue() ? this.menuResource.value().headerMenus : [],
  );

  readonly games = computed(() =>
    this.gamesResource.hasValue() ? this.gamesResource.value() : [],
  );

  async loadBootstrapConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<AppConfig>('config/app-config.json'));
      this.appConfig.set(config);
    } catch (err) {
      console.error('Failed to load app-config.json, falling back to safe defaults.', err);
    }
  }

  getGamesByCategory(category: string): GameDefinition[] {
    const all = this.games();
    if (!category || category === 'all') return all;
    return all.filter((g) => g.category === (category as GameCategory));
  }

  getGameBySlug(slug: string): GameDefinition | undefined {
    return this.games().find((g) => g.slug === slug);
  }
}
