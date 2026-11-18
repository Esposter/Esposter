// Where each emitter field starts in a particle system's serialized bytes, at the mode word that leads it. A field the
// Layout does not place is named as not held rather than read from a guessed offset
export interface ParticleSystemLayout {
  colour?: number;
  life?: number;
  rate?: number;
  size?: number;
}
