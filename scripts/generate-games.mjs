import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pass count per category via CLI: `node scripts/generate-games.mjs 500` (500 * 5 = 2,500 games)
// Defaults to 200 per category = 1,000 games total
const GAMES_PER_CATEGORY = Number(process.argv[2]) || 200;
const BASE_URL = 'https://deepak-devadiga.github.io/GameKit';

const PALETTE = [
  '#00f5d4',
  '#ffbe0b',
  '#ff006e',
  '#fb5607',
  '#8338ec',
  '#3a86ff',
  '#06d6a0',
  '#ef476f',
  '#118ab2',
  '#9b5de5',
  '#00bbf9',
  '#f15bb5',
  '#fee440',
  '#ff9f1c',
  '#4cc9f0',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const LEXICON = {
  arcade: {
    prefix: 'arc',
    adjectives: [
      'Neon',
      'Cyber',
      'Astro',
      'Hyper',
      'Plasma',
      'Quantum',
      'Void',
      'Solar',
      'Turbo',
      'Laser',
      'Photon',
      'Gravity',
      'Omega',
      'Pulse',
      'Vector',
      'Chrono',
      'Nova',
      'Aether',
      'Vortex',
      ' Ion',
    ],
    nouns: [
      'Serpent',
      'Breaker',
      'Dodger',
      'Defender',
      'Runner',
      'Catcher',
      'Hopper',
      'Bounce',
      'Tunnel',
      'Drifter',
      'Interceptor',
      'Striker',
      'Vanguard',
      'Comet',
      'Glider',
      'Raider',
      'Blaster',
      'Orbiter',
      'Dash',
      ' Horizon',
    ],
    modes: ['snake', 'dodger'],
  },
  puzzle: {
    prefix: 'puz',
    adjectives: [
      'Quantum',
      'Chroma',
      'Binary',
      'Hex',
      'Mirror',
      'Pattern',
      'Number',
      'Circuit',
      'Crystal',
      'Neural',
      'Prism',
      'Logic',
      'Matrix',
      'Optical',
      'Runic',
      'Cyber',
      'Isometric',
      'Fractal',
      'Atomic',
      'Zen',
    ],
    nouns: [
      'Slide',
      'Flood',
      'Matrix',
      'Grid',
      'Merge',
      'Beam',
      'Lock',
      'Cascade',
      'Loop',
      'Slider',
      'Nexus',
      'Cipher',
      'Sequence',
      'Relay',
      'Tesseract',
      'Node',
      'Path',
      'Vault',
      'Array',
      'Shift',
    ],
    modes: ['slide', 'lightsout'],
  },
  trivia: {
    prefix: 'trv',
    adjectives: [
      'Geo',
      'Math',
      'Word',
      'Science',
      'Code',
      'Flag',
      'Synonym',
      'History',
      'Anagram',
      'Elemental',
      'Cosmic',
      'Lexicon',
      'Syntax',
      'Calculus',
      'Trivia',
      'Global',
      'Brain',
      'Logic',
      'Quantum',
      'Scholar',
    ],
    nouns: [
      'Blitz',
      'Sprint',
      'Scramble',
      'IQ',
      'Quiz',
      'Master',
      'Clash',
      'Timeline',
      'Forge',
      'Table',
      'Challenge',
      'Arena',
      'Showdown',
      'Gauntlet',
      'Olympiad',
      'Recall',
      'Trial',
      'Quest',
      'Matrix',
      'Dash',
    ],
    modes: ['quiz', 'math', 'scramble'],
    topics: ['geography', 'arithmetic', 'vocabulary', 'science', 'coding', 'history', 'algebra'],
  },
  board: {
    prefix: 'brd',
    adjectives: [
      'Cyber',
      'Memory',
      'High-Low',
      'Rune',
      'Card',
      'Quantum',
      'Sigil',
      'Ace',
      'Grid',
      'Vault',
      'Royal',
      'Arcane',
      'Tactical',
      'Neon',
      'Astral',
      'obsidian',
      'Prime',
      'Nexus',
      'Velvet',
      'Grand',
    ],
    nouns: [
      'Tac-Toe',
      'Pairs',
      'Royale',
      'Match',
      'Streak',
      'Duel',
      'Recall',
      'Flip',
      'Arena',
      'Hold',
      'Gambit',
      'Table',
      'Crown',
      'Matrix',
      'Clash',
      'Deck',
      'Solitaire',
      'Check',
      'Showdown',
      'Pact',
    ],
    modes: ['tictactoe', 'memory', 'highlow'],
    symbolSets: [
      ['X', 'O'],
      ['Δ', 'Ω'],
      ['★', '✦'],
      ['⚡', '🔥'],
      ['◆', '◈'],
    ],
  },
  strategy: {
    prefix: 'str',
    adjectives: [
      'Silicon',
      'Mars',
      'Energy',
      'Star',
      'Dungeon',
      'Hashrate',
      'Tower',
      'Trade',
      'Nanobot',
      'Orbital',
      'Fusion',
      'Galactic',
      'Deep-Space',
      'Cyber',
      'Aether',
      'Quantum',
      'Citadel',
      'Mecha',
      'Solar',
      'Lunar',
    ],
    nouns: [
      'Tycoon',
      'Colony',
      'Manager',
      'Command',
      'Guild',
      'Empire',
      'Bastion',
      'Route',
      'Swarm',
      'Station',
      'Foundry',
      'Syndicate',
      'Dominion',
      'Corp',
      'Frontier',
      'Outpost',
      'Armada',
      'Nexus',
      'Reactor',
      'Forge',
    ],
    resources: [
      'Flops',
      'Oxygen Tons',
      'Megawatts',
      'Titanium',
      'Gold Coins',
      'Hashes',
      'Mana Crystals',
      'Ducats',
      'Nanites',
      'Research Pts',
    ],
    units: [
      'Fab Node',
      'Biodome',
      'Fusion Core',
      'Mining Frigate',
      'Mercenary',
      'Quantum Rig',
      'Sentry Turret',
      'Cargo Galleon',
      'Replicator',
      'Solar Array',
    ],
  },
};

function buildEngineConfig(category, index, difficulty) {
  const diffMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 1.5 : 2.2;

  switch (category) {
    case 'arcade': {
      const mode = LEXICON.arcade.modes[index % LEXICON.arcade.modes.length];
      const speed = Math.min(12, Math.floor(4 + (index % 5) + diffMultiplier * 1.5));
      if (mode === 'snake') {
        return {
          mode: 'snake',
          speed,
          gridSize: 18 + (index % 8),
          targetScore: Math.round(300 * diffMultiplier + (index % 10) * 50),
        };
      }
      return {
        mode: 'dodger',
        speed,
        spawnRate: Number((0.03 + (index % 5) * 0.01 * diffMultiplier).toFixed(3)),
        targetScore: Math.round(250 * diffMultiplier + (index % 10) * 40),
      };
    }

    case 'puzzle': {
      const mode = LEXICON.puzzle.modes[index % LEXICON.puzzle.modes.length];
      const gridSize = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 4 : 5;
      return {
        mode,
        gridSize,
        targetScore: Math.round(80 * diffMultiplier + (index % 8) * 20),
      };
    }

    case 'trivia': {
      const mode = LEXICON.trivia.modes[index % LEXICON.trivia.modes.length];
      const topic = LEXICON.trivia.topics[index % LEXICON.trivia.topics.length];
      const timeLimit = difficulty === 'Easy' ? 45 : difficulty === 'Medium' ? 35 : 25;
      return { mode, topic, timeLimit };
    }

    case 'board': {
      const mode = LEXICON.board.modes[index % LEXICON.board.modes.length];
      if (mode === 'tictactoe') {
        const symbols = LEXICON.board.symbolSets[index % LEXICON.board.symbolSets.length];
        return { mode, symbols };
      }
      if (mode === 'memory') {
        return { mode, pairs: 8 };
      }
      return { mode: 'highlow', decks: (index % 3) + 1 };
    }

    case 'strategy': {
      const resourceName = LEXICON.strategy.resources[index % LEXICON.strategy.resources.length];
      const unitName = LEXICON.strategy.units[index % LEXICON.strategy.units.length];
      return {
        mode: 'idle',
        resourceName,
        unitName,
        baseCost: 10 + (index % 15) * 2,
        baseRate: Math.max(1, Math.round(2 * diffMultiplier + (index % 5))),
      };
    }
  }
}

function buildDescription(category, title, cfg) {
  switch (category) {
    case 'arcade':
      return cfg.mode === 'snake'
        ? `Pilot the cybernetic trail in ${title} across a ${cfg.gridSize}x${cfg.gridSize} grid at speed tier ${cfg.speed} to reach ${cfg.targetScore} points.`
        : `Deflect and harvest high-velocity orbital targets in ${title} at speed tier ${cfg.speed} to hit ${cfg.targetScore} points.`;
    case 'puzzle':
      return cfg.mode === 'slide'
        ? `Restore sequential matrix order across a ${cfg.gridSize}x${cfg.gridSize} tactical sliding grid in ${title}.`
        : `Synchronize every photonic node across a ${cfg.gridSize}x${cfg.gridSize} neural switchboard in ${title}.`;
    case 'trivia':
      return `Test your rapid-fire ${cfg.topic} mastery in ${title} under a ${cfg.timeLimit}-second blitz clock.`;
    case 'board':
      return cfg.mode === 'tictactoe'
        ? `Outmaneuver the heuristic bot using ${cfg.symbols.join(' vs ')} tactical markers in ${title}.`
        : cfg.mode === 'memory'
          ? `Uncover all ${cfg.pairs} matching arcane sigil pairs with minimal flips in ${title}.`
          : `Predict sequential rank probabilities across a ${cfg.decks}-deck shoe in ${title}.`;
    case 'strategy':
      return `Automate ${cfg.unitName} deployments to harvest ${cfg.resourceName} at scale in ${title}.`;
  }
}

function generateCatalog() {
  const categories = Object.keys(LEXICON);
  const games = [];

  for (const category of categories) {
    const meta = LEXICON[category];
    for (let i = 0; i < GAMES_PER_CATEGORY; i++) {
      const adj = meta.adjectives[i % meta.adjectives.length].trim();
      const noun = meta.nouns[Math.floor(i / meta.adjectives.length) % meta.nouns.length].trim();
      const edition =
        i >= meta.adjectives.length * meta.nouns.length
          ? ` MK-${Math.floor(i / (meta.adjectives.length * meta.nouns.length)) + 1}`
          : i >= 20
            ? ` ${i + 1}`
            : '';

      const title = `${adj} ${noun}${edition}`;
      const numStr = String(i + 1).padStart(4, '0');
      const id = `${meta.prefix}-${numStr}`;
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${numStr}`;
      const difficulty = DIFFICULTIES[i % DIFFICULTIES.length];
      const accentColor = PALETTE[(i + categories.indexOf(category) * 3) % PALETTE.length];
      const engineConfig = buildEngineConfig(category, i, difficulty);
      const description = buildDescription(category, title, engineConfig);

      games.push({
        id,
        slug,
        title,
        category,
        description,
        difficulty,
        accentColor,
        engineConfig,
      });
    }
  }

  return games;
}

function generateSitemap(games) {
  const today = new Date().toISOString().split('T')[0];
  const staticRoutes = [
    '/category/all',
    '/category/arcade',
    '/category/puzzle',
    '/category/trivia',
    '/category/board',
    '/category/strategy',
  ];

  const urls = [
    ...staticRoutes.map(
      (route) =>
        `  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    ),
    ...games.map(
      (g) =>
        `  <url>\n    <loc>${BASE_URL}/play/${g.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function run() {
  const publicDir = join(__dirname, '..', 'public');
  const configDir = join(publicDir, 'config');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const games = generateCatalog();
  const gamesPath = join(configDir, 'games.json');
  writeFileSync(gamesPath, JSON.stringify(games, null, 2), 'utf-8');

  // Update badge count in menus.json if it exists
  const menusPath = join(configDir, 'menus.json');
  if (existsSync(menusPath)) {
    const menus = JSON.parse(readFileSync(menusPath, 'utf-8'));
    if (Array.isArray(menus.headerMenus) && menus.headerMenus[0]) {
      menus.headerMenus[0].badge = String(games.length);
      writeFileSync(menusPath, JSON.stringify(menus, null, 2), 'utf-8');
    }
  }

  // Write sitemap.xml & robots.txt for SEO
  const sitemapPath = join(publicDir, 'sitemap.xml');
  writeFileSync(sitemapPath, generateSitemap(games), 'utf-8');

  const robotsPath = join(publicDir, 'robots.txt');
  writeFileSync(robotsPath, `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`, 'utf-8');

  // Inside run() in scripts/generate-games.mjs, right after writing robots.txt:
  const prerenderRoutes = [
    '/category/all',
    '/category/arcade',
    '/category/puzzle',
    '/category/trivia',
    '/category/board',
    '/category/strategy',
    ...games.map((g) => `/play/${g.slug}`),
  ];
  const routesTxtPath = join(__dirname, '..', 'prerender-routes.txt');
  writeFileSync(routesTxtPath, prerenderRoutes.join('\n'), 'utf-8');
  console.log(`✅ Generated ${prerenderRoutes.length} static routes -> prerender-routes.txt`);

  console.log(
    `✅ Generated ${games.length} games (${GAMES_PER_CATEGORY} per category) -> public/config/games.json`,
  );
  console.log(`✅ Generated SEO Sitemap (${games.length + 6} URLs) -> public/sitemap.xml`);
}

run();
