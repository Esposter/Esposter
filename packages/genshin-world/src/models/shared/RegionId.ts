// The save's region id, which the city and the statue maps key by
export const RegionId = {
  Inazuma: "inazuma",
  Liyue: "liyue",
  Mondstadt: "mondstadt",
  NodKrai: "nod-krai",
  Sumeru: "sumeru",
} as const;
export type RegionId = (typeof RegionId)[keyof typeof RegionId];
