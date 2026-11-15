import { Injectable, inject, signal } from '@angular/core';
import { SoundService } from './sound.service';

interface SupportTelemetry {
  completions: number;
  lastShownAt: number;
  completionsAtLastShow: number;
  snoozeUntil: number;
}

const STORAGE_KEY = 'gk_v22_support_telemetry';

@Injectable({ providedIn: 'root' })
export class SupportPromptService {
  private readonly soundService = inject(SoundService);

  readonly supportUrl = 'https://buymeacoffee.com/deepakdevadiga';
  readonly showModal = signal(false);
  readonly modalReason = signal<'highscore' | 'milestone'>('milestone');
  readonly latestScore = signal(0);

  private readonly milestones = new Set([3, 8, 16, 30, 50, 80, 120]);
  private readonly minCooldownMs = 15 * 60 * 1000; // 15 minutes
  private readonly minGamesBetweenPrompts = 4;

  recordGameCompletion(finalScore: number, isNewHighScore: boolean): void {
    const state = this.loadState();
    state.completions += 1;

    const now = Date.now();

    if (now < state.snoozeUntil) {
      this.saveState(state);
      return;
    }

    if (state.completions < 3) {
      this.saveState(state);
      return;
    }

    const gamesSinceLastShow = state.completions - state.completionsAtLastShow;
    const timeSinceLastShow = now - state.lastShownAt;

    if (
      state.lastShownAt > 0 &&
      (timeSinceLastShow < this.minCooldownMs || gamesSinceLastShow < this.minGamesBetweenPrompts)
    ) {
      this.saveState(state);
      return;
    }

    const isMilestone = this.milestones.has(state.completions) || state.completions % 25 === 0;
    const isQualifyingHighScore = isNewHighScore && finalScore >= 50;

    if (isQualifyingHighScore || isMilestone) {
      state.lastShownAt = now;
      state.completionsAtLastShow = state.completions;
      this.saveState(state);

      this.latestScore.set(finalScore);
      this.modalReason.set(isQualifyingHighScore ? 'highscore' : 'milestone');

      setTimeout(() => {
        this.soundService.play('upgrade');
        this.showModal.set(true);
      }, 450);
      return;
    }

    this.saveState(state);
  }

  onSupportClicked(): void {
    const state = this.loadState();
    state.snoozeUntil = Date.now() + 14 * 24 * 60 * 60 * 1000;
    this.saveState(state);
    this.showModal.set(false);
  }

  dismissLater(): void {
    this.soundService.play('click');
    this.showModal.set(false);
  }

  snoozeForToday(): void {
    this.soundService.play('click');
    const state = this.loadState();
    state.snoozeUntil = Date.now() + 24 * 60 * 60 * 1000;
    this.saveState(state);
    this.showModal.set(false);
  }

  private loadState(): SupportTelemetry {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as SupportTelemetry;
      }
    } catch {
      // Ignore storage errors
    }
    return {
      completions: 0,
      lastShownAt: 0,
      completionsAtLastShow: 0,
      snoozeUntil: 0,
    };
  }

  private saveState(state: SupportTelemetry): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }
}
