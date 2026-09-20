import type { PersonaReference } from "@esposter/genshin-persona/src/models/PersonaReference.ts";

// What the runner prints per character beside what it writes: the map's entry, and how much it was measured from
export interface CharacterMeasurement {
  clipCount: number;
  reference: PersonaReference;
  referenceSeconds: number;
  referenceSignalToNoiseDb: number;
}
