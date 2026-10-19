import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";

import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

// Whether a hit a Skill dealt is Elemental DMG, which is neither Physical nor Piercing
export const checkIsGcgElementalHit = (hit: GcgDealtDamage): boolean =>
  hit.damageType !== GcgDamageKind.Physical && hit.damageType !== GcgDamageKind.Piercing;
