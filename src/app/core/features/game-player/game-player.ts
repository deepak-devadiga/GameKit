import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { StorageAuthService } from '../../services/storage-auth.service';
import { SeoService } from '../../services/seo.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-game-player',
  imports: [RouterLink],
  templateUrl: './game-player.html',
  styleUrl: './game-player.scss',
})
export class GamePlayerComponent implements OnDestroy {
  readonly slug = input.required<string>();

  private readonly configService = inject(ConfigService);
  private readonly storageService = inject(StorageAuthService);
  private readonly seoService = inject(SeoService);
  protected readonly soundService = inject(SoundService);

  readonly arcadeCanvas = viewChild<ElementRef<HTMLCanvasElement>>('arcadeCanvas');

  readonly game = computed(() => this.configService.getGameBySlug(this.slug()));
  readonly score = signal(0);
  readonly highScore = computed(() => {
    const g = this.game();
    if (!g) return 0;
    const savedHigh = this.storageService.getProgress(g.id)?.highScore ?? 0;
    return Math.max(savedHigh, this.score());
  });

  // Puzzle state
  readonly puzzleGridSize = signal(4);
  readonly puzzleCells = signal<number[]>([]);

  // Trivia state
  readonly triviaPrompt = signal('');
  readonly triviaOptions = signal<string[]>([]);
  readonly triviaAnswer = signal('');
  readonly triviaStreak = signal(0);

  // Board state
  readonly tttBoard = signal<string[]>(Array(9).fill(''));
  readonly boardStatus = signal('Your Move');
  readonly memoryDeck = signal<{ icon: string; revealed: boolean; matched: boolean }[]>([]);
  readonly currentCard = signal(7);

  // Strategy Idle state
  readonly idleUnits = signal(1);
  readonly idleClickPower = signal(5);
  readonly idleRate = computed(() => {
    const baseRate = Number(this.game()?.engineConfig['baseRate'] ?? 2);
    return this.idleUnits() * baseRate;
  });
  readonly idleNextCost = computed(() => {
    const baseCost = Number(this.game()?.engineConfig['baseCost'] ?? 10);
    return Math.floor(baseCost * Math.pow(1.35, this.idleUnits()));
  });

  private loopHandle: any = null;
  private dir = { x: 1, y: 0 };
  private snake: { x: number; y: number }[] = [];
  private food = { x: 8, y: 8 };
  private obstacles: { x: number; y: number; vy: number }[] = [];
  private playerX = 240;

  constructor() {
    effect(() => {
      const g = this.game();
      if (g) {
        this.seoService.setGameSeo(g);
        queueMicrotask(() => this.initCurrentGame(false));
      }
    });
  }

  toggleAudio(): void {
    this.soundService.toggleMute();
  }

  initCurrentGame(playResetSound = true): void {
    this.clearLoops();
    const g = this.game();
    if (!g) return;

    if (playResetSound) {
      this.soundService.play('reset');
    }

    const saved = this.storageService.getProgress(g.id);
    this.score.set(0);

    switch (g.category) {
      case 'arcade':
        this.startArcadeLoop(g.engineConfig);
        break;
      case 'puzzle':
        this.initPuzzle(g.engineConfig);
        break;
      case 'trivia':
        this.triviaStreak.set(0);
        this.nextTriviaQuestion(g.engineConfig);
        break;
      case 'board':
        this.initBoard(g.engineConfig);
        break;
      case 'strategy':
        if (saved?.savedState?.['units']) {
          this.idleUnits.set(saved.savedState['units']);
          this.score.set(saved.lastScore || 0);
        } else {
          this.idleUnits.set(1);
        }
        this.startStrategyLoop();
        break;
    }
  }

  // ---------------- ARCADE ENGINE (Themed with #FFBF00, #E83F6F, #32936F, #2274A5) ----------------
  private startArcadeLoop(cfg: Record<string, any>): void {
    const mode = cfg['mode'] ?? 'snake';
    this.dir = { x: 1, y: 0 };
    this.snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    this.food = { x: 10, y: 10 };
    this.obstacles = [];
    this.playerX = 240;

    const tickMs = mode === 'snake' ? Math.max(55, 160 - Number(cfg['speed'] ?? 6) * 10) : 30;
    this.loopHandle = setInterval(() => {
      const canvas = this.arcadeCanvas()?.nativeElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Deep Cerulean Night Canvas
      ctx.fillStyle = '#09111E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === 'snake') {
        const head = {
          x: (this.snake[0].x + this.dir.x + 26) % 26,
          y: (this.snake[0].y + this.dir.y + 18) % 18,
        };
        if (this.snake.some((s) => s.x === head.x && s.y === head.y)) {
          this.soundService.play('error');
          this.persistProgress();
          this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 },
          ];
          this.score.set(0);
          return;
        }
        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
          this.soundService.play('pickup');
          this.addScore(25);
          this.food = { x: Math.floor(Math.random() * 26), y: Math.floor(Math.random() * 18) };
        } else {
          this.snake.pop();
        }
        // Electric Rose Target (#E83F6F)
        ctx.fillStyle = '#E83F6F';
        ctx.fillRect(this.food.x * 20 + 2, this.food.y * 20 + 2, 16, 16);

        // Amber Gold Head (#FFBF00) & Emerald Jade Trail (#32936F)
        this.snake.forEach((part, idx) => {
          ctx.fillStyle = idx === 0 ? '#FFBF00' : '#32936F';
          ctx.fillRect(part.x * 20 + 1, part.y * 20 + 1, 18, 18);
        });
      } else {
        this.playerX = Math.max(20, Math.min(460, this.playerX + this.dir.x * 8));
        if (Math.random() < Number(cfg['spawnRate'] ?? 0.05)) {
          this.obstacles.push({ x: Math.random() * 480, y: 0, vy: Number(cfg['speed'] ?? 5) });
        }
        // Emerald Jade Paddle (#32936F)
        ctx.fillStyle = '#32936F';
        ctx.fillRect(this.playerX, 330, 56, 14);

        // Amber Gold Orbs (#FFBF00)
        ctx.fillStyle = '#FFBF00';
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
          const ob = this.obstacles[i];
          ob.y += ob.vy;
          ctx.beginPath();
          ctx.arc(ob.x, ob.y, 8, 0, Math.PI * 2);
          ctx.fill();

          if (ob.y > 322 && ob.y < 348 && ob.x >= this.playerX && ob.x <= this.playerX + 56) {
            this.obstacles.splice(i, 1);
            this.soundService.play('pickup');
            this.addScore(15);
          } else if (ob.y > 360) {
            this.obstacles.splice(i, 1);
          }
        }
      }
    }, tickMs);
  }

  onArcadeKey(event: KeyboardEvent): void {
    const keyMap: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      w: [0, -1],
      ArrowDown: [0, 1],
      s: [0, 1],
      ArrowLeft: [-1, 0],
      a: [-1, 0],
      ArrowRight: [1, 0],
      d: [1, 0],
    };
    const next = keyMap[event.key];
    if (next) {
      event.preventDefault();
      this.setDirection(next[0], next[1]);
    }
  }

  setDirection(dx: number, dy: number): void {
    if (this.dir.x !== dx || this.dir.y !== dy) {
      this.soundService.play('move');
    }
    this.dir = { x: dx, y: dy };
  }

  // ---------------- PUZZLE ENGINE ----------------
  private initPuzzle(cfg: Record<string, any>): void {
    const size = Number(cfg['gridSize'] ?? 4);
    this.puzzleGridSize.set(size);
    const total = size * size;
    if (cfg['mode'] === 'lightsout') {
      const cells = Array.from({ length: total }, () => (Math.random() > 0.5 ? 1 : 0));
      this.puzzleCells.set(cells);
    } else {
      const arr = Array.from({ length: total }, (_, i) => (i + 1) % total);
      arr.sort(() => Math.random() - 0.5);
      this.puzzleCells.set(arr);
    }
  }

  onPuzzleTileClick(idx: number): void {
    const g = this.game();
    if (!g) return;
    const size = this.puzzleGridSize();
    const cells = [...this.puzzleCells()];

    if (g.engineConfig['mode'] === 'lightsout') {
      const toggle = (i: number) => {
        if (i >= 0 && i < cells.length) cells[i] = cells[i] === 1 ? 0 : 1;
      };
      toggle(idx);
      if (idx % size > 0) toggle(idx - 1);
      if (idx % size < size - 1) toggle(idx + 1);
      toggle(idx - size);
      toggle(idx + size);
      this.puzzleCells.set(cells);
      this.addScore(10);

      if (cells.every((c) => c === 1)) {
        this.soundService.play('victory');
        this.addScore(200);
      } else {
        this.soundService.play('move');
      }
    } else {
      const zeroIdx = cells.indexOf(0);
      const r1 = Math.floor(idx / size),
        c1 = idx % size;
      const r2 = Math.floor(zeroIdx / size),
        c2 = zeroIdx % size;
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
        [cells[idx], cells[zeroIdx]] = [cells[zeroIdx], cells[idx]];
        this.puzzleCells.set(cells);
        this.soundService.play('move');
        this.addScore(5);
      } else {
        this.soundService.play('error');
      }
    }
  }

  // ---------------- TRIVIA ENGINE ----------------
  private nextTriviaQuestion(cfg: Record<string, any>): void {
    const mode = cfg['mode'];
    if (mode === 'math') {
      const a = Math.floor(Math.random() * 25) + 4;
      const b = Math.floor(Math.random() * 18) + 3;
      const ans = a * b;
      this.triviaPrompt.set(`Compute: ${a} × ${b} = ?`);
      this.triviaAnswer.set(String(ans));
      this.triviaOptions.set(
        [String(ans), String(ans + 10), String(ans - 6), String(ans + 4)].sort(
          () => Math.random() - 0.5,
        ),
      );
    } else if (mode === 'scramble') {
      const words = [
        'QUANTUM',
        'ANGULAR',
        'SIGNAL',
        'MATRIX',
        'BROWSER',
        'NEBULA',
        'SILICON',
        'SYNTAX',
      ];
      const pick = words[Math.floor(Math.random() * words.length)];
      const scrambled = pick
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
      this.triviaPrompt.set(`Unscramble Lexicon: "${scrambled}"`);
      this.triviaAnswer.set(pick);
      const decoys = words.filter((w) => w !== pick).slice(0, 3);
      this.triviaOptions.set([pick, ...decoys].sort(() => Math.random() - 0.5));
    } else {
      const bank = [
        {
          q: 'Which planet has the highest mountain in the Solar System?',
          a: 'Mars',
          o: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
        },
        { q: 'What is the chemical symbol for Gold?', a: 'Au', o: ['Au', 'Ag', 'Fe', 'Gd'] },
        {
          q: 'Which protocol secures HTTP traffic with TLS?',
          a: 'HTTPS',
          o: ['HTTPS', 'FTP', 'SSH', 'SMTP'],
        },
        {
          q: 'What is the capital city of Australia?',
          a: 'Canberra',
          o: ['Canberra', 'Sydney', 'Melbourne', 'Perth'],
        },
        { q: 'How many bits are in an IPv6 address?', a: '128', o: ['128', '32', '64', '256'] },
      ];
      const item = bank[Math.floor(Math.random() * bank.length)];
      this.triviaPrompt.set(item.q);
      this.triviaAnswer.set(item.a);
      this.triviaOptions.set([...item.o].sort(() => Math.random() - 0.5));
    }
  }

  answerTrivia(selected: string): void {
    const g = this.game();
    if (!g) return;
    if (selected === this.triviaAnswer()) {
      const nextStreak = this.triviaStreak() + 1;
      this.triviaStreak.set(nextStreak);
      this.soundService.play('success');
      this.addScore(25 * nextStreak);
    } else {
      this.triviaStreak.set(0);
      this.soundService.play('error');
    }
    this.nextTriviaQuestion(g.engineConfig);
  }

  // ---------------- BOARD ENGINE ----------------
  private initBoard(cfg: Record<string, any>): void {
    const mode = cfg['mode'];
    if (mode === 'tictactoe') {
      this.tttBoard.set(Array(9).fill(''));
      this.boardStatus.set('Your Move');
    } else if (mode === 'memory') {
      const icons = ['⚡', '🔥', '💎', '🚀', '🪐', '🧬', '🛡️', '👑'];
      const deck = [...icons, ...icons]
        .sort(() => Math.random() - 0.5)
        .map((icon) => ({ icon, revealed: false, matched: false }));
      this.memoryDeck.set(deck);
    } else {
      this.currentCard.set(Math.floor(Math.random() * 13) + 1);
      this.boardStatus.set('Predict the next card rank (1 - 13)');
    }
  }

  playTicTacToe(idx: number): void {
    const board = [...this.tttBoard()];
    const symbols = (this.game()?.engineConfig['symbols'] as string[]) ?? ['X', 'O'];
    if (board[idx] !== '') return;

    this.soundService.play('click');
    board[idx] = symbols[0];
    if (this.checkTttWin(board, symbols[0])) {
      this.tttBoard.set(board);
      this.boardStatus.set('Victory! +100 pts');
      this.soundService.play('victory');
      this.addScore(100);
      setTimeout(() => this.tttBoard.set(Array(9).fill('')), 900);
      return;
    }

    const empty = board.map((v, i) => (v === '' ? i : -1)).filter((i) => i !== -1);
    if (empty.length > 0) {
      const aiChoice = empty[Math.floor(Math.random() * empty.length)];
      board[aiChoice] = symbols[1];
      if (this.checkTttWin(board, symbols[1])) {
        this.boardStatus.set('AI Wins! Round Resetting...');
        this.soundService.play('error');
        setTimeout(() => this.tttBoard.set(Array(9).fill('')), 900);
      }
    } else {
      this.boardStatus.set('Draw! +25 pts');
      this.soundService.play('pickup');
      this.addScore(25);
      setTimeout(() => this.tttBoard.set(Array(9).fill('')), 900);
    }
    this.tttBoard.set(board);
  }

  private checkTttWin(b: string[], sym: string): boolean {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return lines.some(([x, y, z]) => b[x] === sym && b[y] === sym && b[z] === sym);
  }

  flipMemoryCard(idx: number): void {
    const deck = [...this.memoryDeck()];
    if (deck[idx].revealed || deck[idx].matched) return;
    this.soundService.play('cardFlip');
    deck[idx].revealed = true;
    this.memoryDeck.set(deck);

    const open = deck.map((c, i) => ({ c, i })).filter((x) => x.c.revealed && !x.c.matched);
    if (open.length === 2) {
      if (open[0].c.icon === open[1].c.icon) {
        deck[open[0].i].matched = true;
        deck[open[1].i].matched = true;
        this.addScore(40);
        if (deck.every((c) => c.matched)) {
          this.soundService.play('victory');
        } else {
          this.soundService.play('success');
        }
      } else {
        this.soundService.play('error');
        setTimeout(() => {
          const resetDeck = [...this.memoryDeck()];
          resetDeck[open[0].i].revealed = false;
          resetDeck[open[1].i].revealed = false;
          this.memoryDeck.set(resetDeck);
        }, 550);
      }
    }
  }

  guessHighLow(choice: 'higher' | 'lower'): void {
    const prev = this.currentCard();
    const next = Math.floor(Math.random() * 13) + 1;
    this.currentCard.set(next);
    if ((choice === 'higher' && next >= prev) || (choice === 'lower' && next <= prev)) {
      this.soundService.play('success');
      this.addScore(30);
      this.boardStatus.set(`Correct! Card was ${next}`);
    } else {
      this.soundService.play('error');
      this.boardStatus.set(`Missed! Card was ${next}`);
    }
  }

  // ---------------- STRATEGY & IDLE ENGINE ----------------
  private startStrategyLoop(): void {
    this.loopHandle = setInterval(() => {
      this.addScore(this.idleRate(), { units: this.idleUnits() });
    }, 1000);
  }

  manualHarvest(): void {
    this.soundService.play('pickup');
    this.addScore(this.idleClickPower(), { units: this.idleUnits() });
  }

  buyStrategyUnit(): void {
    const cost = this.idleNextCost();
    if (this.score() >= cost) {
      this.score.update((s) => s - cost);
      this.idleUnits.update((u) => u + 1);
      this.soundService.play('upgrade');
      this.persistProgress({ units: this.idleUnits() });
    } else {
      this.soundService.play('error');
    }
  }

  // ---------------- PERSISTENCE ----------------
  private addScore(points: number, savedState?: Record<string, any>): void {
    const next = this.score() + points;
    this.score.set(next);
    this.persistProgress(savedState);
  }

  private persistProgress(savedState?: Record<string, any>): void {
    const g = this.game();
    if (!g) return;
    this.storageService.saveGameProgress(g.id, this.score(), 1, savedState);
  }

  private clearLoops(): void {
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
  }

  ngOnDestroy(): void {
    this.clearLoops();
  }
}
