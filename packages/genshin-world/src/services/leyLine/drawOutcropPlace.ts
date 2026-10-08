import type { OutcropRegion } from "#src/models/leyLine/OutcropRegion";

import { takeOne } from "@esposter/shared";

// The place one kind's outcrop starts at after the daily reset: a section drawn at random from the region's sections,
// And that section's lowest numbered place, the table naming no start. Undefined where the region has no section to draw
export const drawOutcropPlace = (region: OutcropRegion, random: () => number): number | undefined => {
  if (region.sectionIds.length === 0) return undefined;
  const sectionId = takeOne(region.sectionIds, Math.floor(random() * region.sectionIds.length));
  const placeIds = region.places.filter((place) => place.sectionId === sectionId).map(({ id }) => id);
  return placeIds.length > 0 ? Math.min(...placeIds) : undefined;
};
