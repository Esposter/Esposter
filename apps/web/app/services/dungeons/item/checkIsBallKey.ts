import { BallKey, BallKeys } from "#shared/models/dungeons/keys/image/UI/BallKey";

// The set holds the narrow type, and `has` only accepts its own element type — asking it about an unknown
// Value is what this predicate exists for
export const checkIsBallKey = (id: unknown): id is BallKey => BallKeys.has(id as BallKey);
