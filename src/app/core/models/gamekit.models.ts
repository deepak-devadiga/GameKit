export type GameCategory = 'arcade' | 'puzzle' | 'trivia' | 'board' | 'strategy';

export type ThemeMode = 'dark' | 'light';

export type SoundEffectType =
  'click' | 'move' | 'pickup' | 'success' | 'error' | 'victory' | 'upgrade' | 'cardFlip' | 'reset';

export interface AppConfig {
  appName: string;
  version: string;
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    canonicalBaseUrl: string;
    ogImage: string;
  };
  features: {
    enableSoundEffects: boolean;
    enableHighContrastMode: boolean;
    autoSaveIntervalMs: number;
  };
  security: {
    storageKeyPrefix: string;
    enableChecksumValidation: boolean;
    hmacSalt: string;
    maxSessionAgeMinutes: number;
  };
  ui: {
    defaultTheme: ThemeMode;
    cardsPerPage: number;
    showTelemetryFps: boolean;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

export interface MenuConfig {
  headerMenus: MenuItem[];
  footerLinks: { label: string; route: string }[];
}

export interface GameDefinition {
  id: string;
  slug: string;
  title: string;
  category: GameCategory;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  accentColor: string;
  engineConfig: Record<string, any>;
}

export interface GameProgress {
  gameId: string;
  highScore: number;
  lastScore: number;
  levelReached: number;
  timesPlayed: number;
  savedState?: Record<string, any>;
  updatedAt: string;
}
