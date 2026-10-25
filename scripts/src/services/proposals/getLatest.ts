export const getLatest = <T extends { timestamp: number }>(items: T[]): T | undefined =>
  items.reduce<T | undefined>(
    (latest, item) => (latest && latest.timestamp >= item.timestamp ? latest : item),
    undefined,
  );
