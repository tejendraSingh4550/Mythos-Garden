import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type BiomeId = 'mosslight' | 'glass-dunes' | 'moon-tide';
type Species = { id: string; name: string; role: string; icon: string; note: string; tint: string };
type Biome = { id: BiomeId; name: string; subtitle: string; icon: string; colors: string; flora: string; fauna: string };

const BIOMES: Biome[] = [
  { id: 'mosslight', name: 'Mosslight Hollow', subtitle: 'A gentle forest under a floating moon', icon: '◉', colors: 'fern · jade · lantern gold', flora: 'whisper fern', fauna: 'moss deer' },
  { id: 'glass-dunes', name: 'The Glass Dunes', subtitle: 'Warm winds sing across crystal sand', icon: '◇', colors: 'amber · rose · deep plum', flora: 'singing glassgrass', fauna: 'dune fox' },
  { id: 'moon-tide', name: 'Moonpool Reach', subtitle: 'A tidepool suspended in the night sky', icon: '≈', colors: 'lagoon · lilac · pearl', flora: 'drift kelp', fauna: 'cloud ray' },
];

const SPECIES: Species[] = [
  { id: 'moth', name: 'Lantern moth', role: 'POLLINATOR', icon: '✳', note: 'Carries glow-pollen between blooms', tint: 'gold' },
  { id: 'deer', name: 'Moss deer', role: 'GRAZER', icon: '♧', note: 'Keeps the silvergrass from spreading', tint: 'mint' },
  { id: 'hare', name: 'Cloud hare', role: 'SEED KEEPER', icon: '⌁', note: 'Hides seeds in little sky burrows', tint: 'lilac' },
  { id: 'whale', name: 'Pocket whale', role: 'SKY FILTER', icon: '◜', note: 'Sifts stardust from the upper air', tint: 'blue' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly biomes = BIOMES;
  protected readonly species = SPECIES;
  protected readonly biomeId = signal<BiomeId>('mosslight');
  protected readonly selected = signal<string[]>(['moth', 'deer']);
  protected readonly moisture = signal(62);
  protected readonly warmth = signal(48);
  protected readonly starlight = signal(71);
  protected readonly saved = signal(false);
  protected readonly biome = computed(() => BIOMES.find((b) => b.id === this.biomeId())!);
  protected readonly health = computed(() => {
    const values = [this.moisture(), this.warmth(), this.starlight()];
    const balance = values.reduce((sum, value) => sum + Math.max(0, 100 - Math.abs(value - 58) * 1.7), 0) / 3;
    return Math.min(99, Math.round(balance * 0.78 + this.selected().length * 5.5));
  });
  protected readonly status = computed(() => this.health() > 82 ? 'THRIVING' : this.health() > 65 ? 'FINDING BALANCE' : 'NEEDS A LITTLE CARE');

  constructor() {
    try {
      const stored = localStorage.getItem('mythos-garden-world');
      if (stored) {
        const world = JSON.parse(stored);
        if (BIOMES.some((b) => b.id === world.biome)) this.biomeId.set(world.biome);
        if (Array.isArray(world.species)) this.selected.set(world.species.filter((id: string) => SPECIES.some((s) => s.id === id)));
        if (Number.isFinite(world.moisture)) this.moisture.set(world.moisture);
        if (Number.isFinite(world.warmth)) this.warmth.set(world.warmth);
        if (Number.isFinite(world.starlight)) this.starlight.set(world.starlight);
      }
    } catch { /* Start with a fresh garden if saved data is unavailable. */ }
  }

  protected chooseBiome(id: BiomeId) { this.biomeId.set(id); this.saved.set(false); }
  protected toggleSpecies(id: string) {
    this.selected.update((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    this.saved.set(false);
  }
  protected setClimate(key: 'moisture' | 'warmth' | 'starlight', event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this[key].set(value); this.saved.set(false);
  }
  protected saveGarden() {
    const snapshot = { biome: this.biomeId(), species: this.selected(), moisture: this.moisture(), warmth: this.warmth(), starlight: this.starlight() };
    try { localStorage.setItem('mythos-garden-world', JSON.stringify(snapshot)); } catch { /* Private browsing can block storage; the garden still works. */ }
    this.saved.set(true);
  }
  protected newWorld() {
    this.biomeId.set('mosslight'); this.selected.set(['moth', 'deer']);
    this.moisture.set(62); this.warmth.set(48); this.starlight.set(71); this.saved.set(false);
  }
}
