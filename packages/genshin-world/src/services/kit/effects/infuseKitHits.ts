import type { Kit } from "#src/models/kit/Kit";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInfusion } from "#src/models/kit/KitInfusion";

// The hits a step landed from the normal attacks, charged attack and plunges of a kit, which an infusion makes deal its
// Element at the gauge the hit gives it, written in place from the index the step's hits began at. A hit with no gauge of
// Its own gives the infused element's 1U, and a collision with a gauge of its own, 0U, keeps it. An infusion that
// Converts its attacks also gives each hit its converted poise and reach, where it has them, and an infusion with a DMG
// Bonus adds it to each hit's own
export const infuseKitHits = (
  kit: Kit,
  { damageBonus, element, isConverted }: KitInfusion,
  landedHits: KitHit[],
  fromIndex: number,
): void => {
  const infusableHits = new Set<KitHit>([
    ...kit.normalAttacks.flatMap(({ hits }) => hits),
    ...kit.chargedAttack.hits,
    ...kit.lowPlunge.hits,
    ...kit.highPlunge.hits,
    kit.plungeCollision,
  ]);
  for (const [index, hit] of landedHits.entries())
    if (index >= fromIndex && infusableHits.has(hit))
      landedHits[index] = {
        ...hit,
        ...(damageBonus !== undefined && { damageBonus: (hit.damageBonus ?? 0) + damageBonus }),
        element,
        gauge: hit.gauge ?? 1,
        hitArea: isConverted ? (hit.convertedHitArea ?? hit.hitArea) : hit.hitArea,
        poiseDamage: isConverted ? (hit.convertedPoiseDamage ?? hit.poiseDamage) : hit.poiseDamage,
      };
};
