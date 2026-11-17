export const BallKey = { CosmoBall: "CosmoBall", DamagedBall: "DamagedBall" } as const;
export type BallKey = (typeof BallKey)[keyof typeof BallKey];
