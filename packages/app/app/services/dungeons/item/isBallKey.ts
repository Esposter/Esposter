import { BallKey, BallKeys } from "#shared/models/dungeons/keys/image/UI/BallKey";

export const isBallKey = (id: unknown): id is BallKey => BallKeys.has(id as BallKey);
