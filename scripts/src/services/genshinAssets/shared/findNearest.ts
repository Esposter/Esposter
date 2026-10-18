// The item nearest a place by the distance to it, the first where two are as near, or undefined where there are no items
export const findNearest = <T>(items: readonly T[], getDistance: (item: T) => number): T | undefined => {
  let nearest: undefined | { distance: number; item: T };
  for (const item of items) {
    const distance = getDistance(item);
    if (!nearest || distance < nearest.distance) nearest = { distance, item };
  }
  return nearest?.item;
};
