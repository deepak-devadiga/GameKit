import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { StorageAuthService } from '../../services/storage-auth.service';
import { SeoService } from '../../services/seo.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class CatalogComponent {
  readonly categoryId = input<string>('all');

  private readonly configService = inject(ConfigService);
  private readonly storageService = inject(StorageAuthService);
  private readonly seoService = inject(SeoService);
  private readonly soundService = inject(SoundService);

  readonly searchQuery = signal('');
  readonly selectedDifficulty = signal<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  readonly pageSize = computed(() => this.configService.appConfig()?.ui.cardsPerPage ?? 60);
  readonly visibleLimit = signal(60);

  readonly progressMap = this.storageService.progressMap;

  readonly activeTitle = computed(() => {
    const cat = this.categoryId() || 'all';
    return cat === 'all' ? 'Instant Browser Arcade' : `${cat} Collection`;
  });

  readonly filteredGames = computed(() => {
    const cat = this.categoryId() || 'all';
    const q = this.searchQuery().trim().toLowerCase();
    const diff = this.selectedDifficulty();

    return this.configService.getGamesByCategory(cat).filter((g) => {
      const matchesDiff = diff === 'All' || g.difficulty === diff;
      const matchesQuery =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      return matchesDiff && matchesQuery;
    });
  });

  readonly visibleGames = computed(() => this.filteredGames().slice(0, this.visibleLimit()));

  readonly hasMore = computed(() => this.visibleLimit() < this.filteredGames().length);

  constructor() {
    effect(() => {
      const cat = this.categoryId() || 'all';
      const count = this.filteredGames().length;
      this.seoService.setCategorySeo(cat, count);
    });
  }

  onSearch(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    this.searchQuery.set(inputEl.value);
    this.visibleLimit.set(this.pageSize());
  }

  setDifficulty(diff: 'All' | 'Easy' | 'Medium' | 'Hard'): void {
    this.soundService.play('click');
    this.selectedDifficulty.set(diff);
    this.visibleLimit.set(this.pageSize());
  }

  loadMore(): void {
    this.soundService.play('click');
    this.visibleLimit.update((current) => current + this.pageSize());
  }
}
