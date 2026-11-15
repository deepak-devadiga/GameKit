import { Injectable, computed, inject, signal } from '@angular/core';
import { ConfigService } from './config.service';
import { SoundEffectType } from '../models/gamekit.models';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly configService = inject(ConfigService);
  private audioCtx: AudioContext | null = null;

  private readonly userMuted = signal<boolean>(this.loadInitialMuteState());
  readonly masterVolume = signal<number>(0.25);

  readonly isEnabled = computed(() => {
    const configAllowed = this.configService.appConfig()?.features.enableSoundEffects ?? true;
    return configAllowed && !this.userMuted();
  });

  private loadInitialMuteState(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('gk_v22_sound_muted') === 'true';
  }

  toggleMute(): void {
    const next = !this.userMuted();
    this.userMuted.set(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gk_v22_sound_muted', String(next));
    }
    if (!next) {
      this.play('click');
    }
  }

  play(effect: SoundEffectType): void {
    if (!this.isEnabled() || typeof window === 'undefined') return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (effect) {
      case 'click':
        this.playTone(ctx, 520, 680, 0.045, 'sine', now);
        break;
      case 'move':
        this.playTone(ctx, 240, 310, 0.04, 'triangle', now);
        break;
      case 'cardFlip':
        this.playTone(ctx, 400, 760, 0.065, 'sine', now);
        break;
      case 'pickup':
        this.playTone(ctx, 587.33, 880, 0.09, 'square', now);
        break;
      case 'success':
        this.playTone(ctx, 523.25, 659.25, 0.08, 'triangle', now);
        this.playTone(ctx, 659.25, 783.99, 0.11, 'triangle', now + 0.075);
        break;
      case 'upgrade':
        this.playTone(ctx, 440, 554.37, 0.07, 'sawtooth', now);
        this.playTone(ctx, 554.37, 880, 0.12, 'sawtooth', now + 0.07);
        break;
      case 'victory':
        this.playTone(ctx, 523.25, 523.25, 0.08, 'square', now);
        this.playTone(ctx, 659.25, 659.25, 0.08, 'square', now + 0.08);
        this.playTone(ctx, 783.99, 783.99, 0.08, 'square', now + 0.16);
        this.playTone(ctx, 1046.5, 1046.5, 0.22, 'square', now + 0.24);
        break;
      case 'error':
        this.playTone(ctx, 220, 130, 0.18, 'sawtooth', now);
        break;
      case 'reset':
        this.playTone(ctx, 480, 220, 0.12, 'sine', now);
        break;
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playTone(
    ctx: AudioContext,
    startFreq: number,
    endFreq: number,
    durationSec: number,
    type: OscillatorType,
    startTime: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    if (startFreq !== endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + durationSec);
    }

    const peakGain = this.masterVolume();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.01);
  }
}
