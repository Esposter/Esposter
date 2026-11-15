// The save's region id, which the city and the statue maps key by
export const RegionId = { Mondstadt: "mondstadt" } as const;
export type RegionId = (typeof RegionId)[keyof typeof RegionId];
