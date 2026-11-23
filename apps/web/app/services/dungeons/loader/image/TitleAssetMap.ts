import type { ImageFileKey } from "#shared/generated/phaser/FileKey";

import { FileKey } from "#shared/generated/phaser/FileKey";
import titleScreenBackground from "#src/assets/dungeons/scene/title/screenBackground.webp";
import titleText from "#src/assets/dungeons/scene/title/text.png";
import titleTextBackground from "#src/assets/dungeons/scene/title/textBackground.png";

export const TitleAssetMap = {
  [FileKey.SceneTitleScreenBackground]: titleScreenBackground,
  [FileKey.SceneTitleText]: titleText,
  [FileKey.SceneTitleTextBackground]: titleTextBackground,
} as const satisfies Partial<Record<ImageFileKey, string>>;
