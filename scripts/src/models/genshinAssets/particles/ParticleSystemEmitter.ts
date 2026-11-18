import type { EmitterSettings } from "#src/models/genshinAssets/particles/EmitterSettings";

// One particle system of a component's layout blocks: its block and file, the game object it sits on and its settings
export interface ParticleSystemEmitter {
  block: string;
  file: string;
  owner: string;
  settings: EmitterSettings;
}
