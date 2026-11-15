import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ConfigService } from './config.service';
import { GameDefinition } from '../models/gamekit.models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly configService = inject(ConfigService);

  private readonly defaultBaseUrl = 'https://deepak-devadiga.github.io/gamekit';
  private readonly defaultOgImage =
    'https://deepak-devadiga.github.io/gamekit/assets/og-banner.png';

  setCategorySeo(category: string, gameCount: number): void {
    const formattedCat = category === 'all' ? 'All Instant' : category.toUpperCase();
    const pageTitle = `${formattedCat} Browser Games (${gameCount}) | GameKit`;
    const description = `Play ${gameCount} free ${formattedCat} HTML5 mini-games directly in your browser. Instant load, zero install, and automatic progress saving.`;
    const base = this.configService.appConfig()?.seo.canonicalBaseUrl ?? this.defaultBaseUrl;
    const ogImage = this.configService.appConfig()?.seo.ogImage ?? this.defaultOgImage;

    this.title.setTitle(pageTitle);
    this.updateMetaTags(pageTitle, description, `/category/${category}`, ogImage);
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle,
      description,
      url: `${base}/category/${category}`,
      image: ogImage,
      numberOfItems: gameCount,
    });
  }

  setGameSeo(game: GameDefinition): void {
    const pageTitle = `${game.title} — Play Free ${game.category.toUpperCase()} Game | GameKit`;
    const base = this.configService.appConfig()?.seo.canonicalBaseUrl ?? this.defaultBaseUrl;
    const ogImage = this.configService.appConfig()?.seo.ogImage ?? this.defaultOgImage;

    this.title.setTitle(pageTitle);
    this.updateMetaTags(pageTitle, game.description, `/play/${game.slug}`, ogImage);

    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: game.title,
      description: game.description,
      genre: game.category,
      url: `${base}/play/${game.slug}`,
      image: ogImage,
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      operatingSystem: 'Web Browser',
      author: {
        '@type': 'Person',
        name: 'Deepak K B',
        url: 'https://deepak-devadiga.github.io/aboutme/',
      },
    });
  }

  private updateMetaTags(title: string, description: string, path: string, ogImage: string): void {
    const base = this.configService.appConfig()?.seo.canonicalBaseUrl ?? this.defaultBaseUrl;
    const url = `${base}${path}`;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    let canonical = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  private setJsonLd(schemaObject: Record<string, any>): void {
    let script = this.doc.getElementById('gamekit-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'gamekit-jsonld';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaObject);
  }
}
