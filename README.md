<div align="center">

![GameKit Banner](public/assets/og-banner.png)

# 🎮 GameKit — Instant Browser Mini-Games Arcade

**1,000+ Zero-Install HTML5 Mini-Games Built with Angular 22.1 Signals**

[![Live Demo](https://img.shields.io/badge/Live_Arcade-Play_Now-FFBF00?style=for-the-badge&logo=googlechrome&logoColor=09111E)](https://deepak-devadiga.github.io/GameKit/)
[![Angular](https://img.shields.io/badge/Angular-22.1.0-E83F6F?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-2274A5?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/Security-HMAC_Protected-32936F?style=for-the-badge)](#security--session-integrity)

</div>

---

## ⚡ Overview

**GameKit** is a high-performance, frontend-only web arcade capable of serving thousands of instant browser mini-games with zero backend dependencies. Built on **Angular 22.1.0** using a zoneless, signal-first architecture (`httpResource`, `@defer (on viewport)`, and standalone components), GameKit dynamically renders 5 distinct game engines driven entirely by external JSON configurations.

👉 **Play Live:** **[https://deepak-devadiga.github.io/GameKit/](https://deepak-devadiga.github.io/GameKit/)**

---

## ✨ Key Features

- **🕹️ Parametric Multi-Engine Architecture:** Scales to 1,000+ unique games across **5 Categories** (_Arcade, Puzzle, Trivia & Word, Card & Board, Strategy & Idle_) by reading physics speeds, grid matrices, decks, and rules from `public/config/games.json`.
- **🛡️ HMAC Checksum Session Persistence:** Automatically saves player high scores, play counts, and idle-game states in `localStorage`, protected by deterministic FNV-1a + Salt integrity signatures to detect client-side tampering.
- **🔊 Zero-Asset Web Audio Synthesizer (`SoundService`):** Generates real-time retro arcade, card flip, puzzle slide, and victory sound effects using the native browser Web Audio API (`AudioContext` & `OscillatorNode`) with zero external MP3/WAV downloads.
- **🎨 Custom Cyber-Arcade Theme System (`ThemeService`):** Seamless **Deep Midnight (Dark)** and **Crisp Daylight (Light)** modes powered by CSS custom properties:
  - **Primary (Amber Gold):** `#FFBF00`
  - **Secondary (Electric Rose):** `#E83F6F`
  - **Tertiary (Cerulean Blue):** `#2274A5`
  - **Accent (Emerald Jade):** `#32936F`
  - **Pure Light:** `#FFFFFF`
- **🔍 Full Technical SEO & Rich Snippets (`SeoService`):** Dynamic `<title>`, OpenGraph/Twitter cards, canonical link tags, `VideoGame` and `CollectionPage` Schema.org JSON-LD injection, plus automated `sitemap.xml` and `robots.txt` generation.
- **⚙️ JSON-Driven UI & Menus:** Navigation links, category badges, feature flags, and security salts are controlled via `public/config/menus.json` and `public/config/app-config.json` without touching TypeScript code.

---

## 🎯 Game Categories & Engines

| Category            | Route                | Engine Modes                     | Gameplay Mechanics                                                                                                     |
| :------------------ | :------------------- | :------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Arcade**          | `/category/arcade`   | `snake`, `dodger`                | HTML5 `<canvas>` 60fps directional serpent trails & orbital asteroid/orb catchers with keyboard + touch D-pad support. |
| **Puzzle**          | `/category/puzzle`   | `slide`, `lightsout`             | Configurable $3\times3$, $4\times4$, and $5\times5$ sliding number matrices and neural binary switchboards.            |
| **Trivia & Word**   | `/category/trivia`   | `quiz`, `math`, `scramble`       | Streak-multiplier lexicon anagrams, mental arithmetic sprints, and multi-topic rapid-fire quizzes.                     |
| **Card & Board**    | `/category/board`    | `tictactoe`, `memory`, `highlow` | Heuristic AI tactical grid duels, spatial sigil pair matching, and multi-deck probability streaks.                     |
| **Strategy & Idle** | `/category/strategy` | `idle`                           | Automated resource harvesters, exponential unit cost scaling, and persistent background production.                    |

---

## 🗂️ Modular Project Structure

All components follow strict separation of concerns with dedicated `.ts`, `.html`, and `.scss` files, and domain logic organized into `models/`, `services/`, and `features/`.

```text
GameKit/
├── .github/
│   └── workflows/
│       └── deploy.yml                # Automated CI/CD pipeline for GitHub Pages
├── public/
│   ├── assets/
│   │   └── og-banner.png             # OpenGraph & social preview banner
│   ├── config/
│   │   ├── app-config.json           # Global feature flags, SEO, and security config
│   │   ├── menus.json                # Dynamic navigation bar items & badges
│   │   └── games.json                # 1,000+ procedural game definitions
│   ├── robots.txt                    # Search crawler rules
│   └── sitemap.xml                   # Auto-generated SEO sitemap for all routes
├── scripts/
│   └── generate-games.mjs            # Procedural game & sitemap generator script
└── src/
    ├── app/
    │   ├── models/
    │   │   └── gamekit.models.ts     # Strict TypeScript interfaces & types
    │   ├── services/
    │   │   ├── config.service.ts     # Angular 22 httpResource JSON loader
    │   │   ├── security.service.ts   # FNV-1a HMAC checksum & HTTP interceptor
    │   │   ├── seo.service.ts        # Dynamic Meta, Canonical & JSON-LD Schema
    │   │   ├── sound.service.ts      # Web Audio API real-time SFX synthesizer
    │   │   ├── storage-auth.service.ts # Tamper-checked local progress manager
    │   │   └── theme.service.ts      # Reactive Dark/Light theme controller
    │   ├── features/
    │   │   ├── catalog/              # Searchable, filterable, deferred game grid
    │   │   │   ├── catalog.ts
    │   │   │   ├── catalog.html
    │   │   │   └── catalog.scss
    │   │   └── game-player/          # Polymorphic 5-category game engine view
    │   │       ├── game-player.ts
    │   │       ├── game-player.html
    │   │       └── game-player.scss
    │   ├── app.ts
    │   ├── app.html
    │   ├── app.scss
    │   ├── app.config.ts
    │   └── app.routes.ts
    ├── index.html
    └── styles.scss                   # Global CSS custom properties & glassmorphism
```
