import { takeOne } from "@esposter/shared";

// Draws `count` place ids at random, each taken out of the free ones before the next is drawn, so none repeats. A count
// Above the number of free ids draws every one of them, and the draws come in order, so one random sequence always gives
// The same places
export const drawPlaceIds = (placeIds: readonly string[], count: number, random: () => number): string[] => {
  const drawnIds: string[] = [];
  let freeIds = placeIds;
  for (let index = 0; index < Math.min(count, placeIds.length); index++) {
    const id = takeOne(freeIds, Math.floor(random() * freeIds.length));
    drawnIds.push(id);
    freeIds = freeIds.filter((placeId) => placeId !== id);
  }
  return drawnIds;
};
