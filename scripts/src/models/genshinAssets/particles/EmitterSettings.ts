import type { EmitterValue } from "#src/models/genshinAssets/particles/EmitterValue";

// A particle system's rate, life, size and colour, each read from its bytes or named as not held
export interface EmitterSettings {
  colour: EmitterValue<[number, number, number, number]>;
  life: EmitterValue<number>;
  rate: EmitterValue<number>;
  size: EmitterValue<number>;
}
