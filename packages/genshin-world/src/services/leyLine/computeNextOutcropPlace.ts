import type { OutcropRegion } from "#src/models/leyLine/OutcropRegion";

// The first place a place moves to next, undefined where the place is not in the region or moves to none
const findFirstNextId = ({ places }: OutcropRegion, placeId: number): number | undefined =>
  places.find((place) => place.id === placeId)?.nextIds[0];

// The place a claimed outcrop moves to from its place: the next place it moves to, or the one after that when the other
// Kind stands there. Undefined where neither can be taken, so the outcrop stays where it is until the daily reset
export const computeNextOutcropPlace = (
  region: OutcropRegion,
  placeId: number,
  otherKindPlaceId: number | undefined,
): number | undefined => {
  const nextId = findFirstNextId(region, placeId);
  if (nextId === undefined) return undefined;
  else if (nextId === otherKindPlaceId) return findFirstNextId(region, nextId);
  else return nextId;
};
