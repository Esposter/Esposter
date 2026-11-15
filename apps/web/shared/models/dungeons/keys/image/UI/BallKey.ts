export const BallKey = { CosmoBall: "CosmoBall", DamagedBall: "DamagedBall" } as const;
export type BallKey = (typeof BallKey)[keyof typeof BallKey];

export const BallKeys: ReadonlySet<BallKey> = new Set(Object.values(BallKey));
