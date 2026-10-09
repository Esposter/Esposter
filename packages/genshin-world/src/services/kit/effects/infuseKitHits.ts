import type { Element } from "#src/models/Element";
import type { Kit } from "#src/models/kit/Kit";
import type { KitHit } from "#src/models/kit/KitHit";

// The hits a step landed from the normal attacks, charged attack and plunges of a kit, which an infusion makes deal its
// Element at the gauge the hit gives it, written in place from the index the step's hits began at. A hit with no gauge of
// Its own gives the infused element's 1U, and a collision with a gauge of its own, 0U, keeps it
export const infuseKitHits = (kit: Kit, element: Element, landedHits: KitHit[], fromIndex: number): void => {
  const infusableHits = new Set<KitHit>([
    ...kit.normalAttacks.flatMap(({ hits }) => hits),
    ...kit.chargedAttack.hits,
    ...kit.lowPlunge.hits,
    ...kit.highPlunge.hits,
    kit.plungeCollision,
  ]);
  for (const [index, hit] of landedHits.entries())
    if (index >= fromIndex && infusableHits.has(hit)) landedHits[index] = { ...hit, element, gauge: hit.gauge ?? 1 };
};
