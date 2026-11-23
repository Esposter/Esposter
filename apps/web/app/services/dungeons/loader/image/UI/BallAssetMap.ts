import type { ImageFileKey } from "#shared/generated/phaser/FileKey";

import { FileKey } from "#shared/generated/phaser/FileKey";
import cosmoBall from "#src/assets/dungeons/UI/balls/cosmoBall.png";
import damagedBall from "#src/assets/dungeons/UI/balls/damagedBall.png";

export const BallAssetMap = {
  [FileKey.UIBallsCosmoBall]: cosmoBall,
  [FileKey.UIBallsDamagedBall]: damagedBall,
} as const satisfies Partial<Record<ImageFileKey, string>>;
