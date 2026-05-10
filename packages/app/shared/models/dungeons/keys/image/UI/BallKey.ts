export enum BallKey {
  CosmoBall = "CosmoBall",
  DamagedBall = "DamagedBall",
}

export const BallKeys: ReadonlySet<BallKey> = new Set(Object.values(BallKey));
