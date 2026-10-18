// The points a collector holds after it gathers some: what it held and gained, up to its maximum. The points gathered
// Beyond the maximum are lost
export const storeCollectorPoints = (heldPoints: number, gainedPoints: number, maxPoints: number): number =>
  Math.min(heldPoints + gainedPoints, maxPoints);
