import { TitleKey } from "#shared/models/dungeons/keys/image/TitleKey";
import titleScreenBackground from "#src/assets/dungeons/scene/title/screenBackground.webp";
import titleText from "#src/assets/dungeons/scene/title/text.png";
import titleTextBackground from "#src/assets/dungeons/scene/title/textBackground.png";

export const TitleAssetMap = {
  [TitleKey.TitleScreenBackground]: titleScreenBackground,
  [TitleKey.TitleText]: titleText,
  [TitleKey.TitleTextBackground]: titleTextBackground,
} as const satisfies Record<TitleKey, string>;
