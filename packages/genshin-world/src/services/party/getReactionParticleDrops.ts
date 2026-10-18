import type { ElementalResonance } from "#src/models/party/ElementalResonance";
import type { ParticleDrop } from "#src/models/party/ParticleDrop";
import type { Party } from "#src/models/party/Party";
import type { Reaction } from "#src/models/combat/Reaction";

import { Element } from "#src/models/Element";
import { ParticleSource } from "#src/models/party/ParticleSource";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { HIGH_VOLTAGE_REACTION_TYPES } from "#src/services/party/constants";
import { ParticleSourceCooldownSecondsMap } from "#src/services/party/ParticleSourceCooldownSecondsMap";

// The Electro particles the team's High Voltage drops for the listed reactions a hit triggers on an enemy: one for each
// Reaction the team has no particle cooldown for, starting its cooldown as it drops, and none without High Voltage
export const getReactionParticleDrops = (
  party: Party,
  reactions: readonly Reaction[],
  elementalResonances: readonly ElementalResonance[],
): ParticleDrop[] => {
  if (!elementalResonances.includes(Element.Electro)) return [];
  const particles: ParticleDrop[] = [];
  for (const { reactionType } of reactions) {
    if (!HIGH_VOLTAGE_REACTION_TYPES.includes(reactionType)) continue;
    if ((party.particleCooldownSecondsMap.get(ParticleSource.HighVoltage) ?? 0) > 0) continue;
    party.particleCooldownSecondsMap.set(
      ParticleSource.HighVoltage,
      ParticleSourceCooldownSecondsMap[ParticleSource.HighVoltage],
    );
    particles.push({ count: 1, element: Element.Electro, energyDropKind: EnergyDropKind.Particle });
  }
  return particles;
};
