// The items an offering holds, counted across every kind, which is how its progress is compared with another's
export const countHeldItems = (heldCounts: Readonly<Record<string, number>>): number =>
  Object.values(heldCounts).reduce((total, count) => total + count, 0);
