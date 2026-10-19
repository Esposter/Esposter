import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";

import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";

// The particles an enemy drops as its health falls to each of the percentages, every drop of the same count
export const createParticleDrops = (healthPercents: number[], count = 1): EnergyDrop[] =>
  healthPercents.map((healthPercent) => ({ count, energyDropKind: EnergyDropKind.Particle, healthPercent }));
