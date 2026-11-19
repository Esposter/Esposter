import { BallKey } from "#shared/models/dungeons/keys/image/UI/BallKey";
import cosmoBall from "#src/assets/dungeons/UI/balls/cosmoBall.png";
import damagedBall from "#src/assets/dungeons/UI/balls/damagedBall.png";

export const BallAssetMap = {
  [BallKey.CosmoBall]: cosmoBall,
  [BallKey.DamagedBall]: damagedBall,
} as const satisfies Record<BallKey, string>;
