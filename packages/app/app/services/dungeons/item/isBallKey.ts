import { BallKey } from "#shared/models/dungeons/keys/image/UI/BallKey";

export const isBallKey = (id: unknown): id is BallKey => Object.values<unknown>(BallKey).includes(id);
