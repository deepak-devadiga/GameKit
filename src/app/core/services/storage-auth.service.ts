import { Injectable, computed, inject, signal } from '@angular/core';
import { ConfigService } from './config.service';
import { SecurityService } from './security.service';
import { GameProgress } from '../models/gamekit.models';

@Injectable({ providedIn: 'root' })
export class StorageAuthService {
  private readonly config = inject(ConfigService);
  private readonly security = inject(SecurityService);

  readonly progressMap = signal<Record<string, GameProgress>>({});

  readonly totalHighScore = computed(() =>
    Object.values(this.progressMap()).reduce((acc, item) => acc + (item.highScore || 0), 0),
  );

  readonly gamesPlayedCount = computed(() => Object.keys(this.progressMap()).length);

  constructor() {
    this.restoreSession();
  }

  private get storageKey(): string {
    const prefix = this.config.appConfig()?.security.storageKeyPrefix ?? 'gk_v22_';
    return `${prefix}progress_local`;
  }

  restoreSession(): void {
    if (typeof window === 'undefined') return;
    const saved = this.security.unwrapSignedPayload<Record<string, GameProgress>>(
      localStorage.getItem(this.storageKey),
    );
    this.progressMap.set(saved ?? {});
  }

  saveGameProgress(
    gameId: string,
    score: number,
    levelReached = 1,
    savedState?: Record<string, any>,
  ): void {
    const currentMap = { ...this.progressMap() };
    const existing = currentMap[gameId];

    const updated: GameProgress = {
      gameId,
      highScore: Math.max(existing?.highScore ?? 0, score),
      lastScore: score,
      levelReached: Math.max(existing?.levelReached ?? 1, levelReached),
      timesPlayed: (existing?.timesPlayed ?? 0) + 1,
      savedState: savedState ?? existing?.savedState,
      updatedAt: new Date().toISOString(),
    };

    currentMap[gameId] = updated;
    this.progressMap.set(currentMap);
    this.persistToStorage(currentMap);
  }

  getProgress(gameId: string): GameProgress | undefined {
    return this.progressMap()[gameId];
  }

  private persistToStorage(map: Record<string, GameProgress>): void {
    if (typeof window === 'undefined') return;
    const signed = this.security.wrapSignedPayload(map);
    localStorage.setItem(this.storageKey, signed);
  }
}
