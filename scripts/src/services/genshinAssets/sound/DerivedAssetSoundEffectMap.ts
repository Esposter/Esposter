import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { LOGIN_DOOR_SOUNDS, MINIMUM_PACKAGE_NAME } from "#src/services/genshinAssets/shared/constants";

// Each component's sound effects by the name its fitted `<component>/sounds.json` keeps each under: the game's sounds
// `genshin:assets sounds` matched for it, in the packages a pattern names, which `fit` reads its levels from and the
// Audio pass scores it against
export const DerivedAssetSoundEffectMap: Record<
  DerivedAssetComponent,
  Record<string, { pattern: string; sounds: readonly SoundStart[] }>
> = {
  [DerivedAssetComponent.Login]: { door: { pattern: MINIMUM_PACKAGE_NAME, sounds: LOGIN_DOOR_SOUNDS } },
  [DerivedAssetComponent.Windrise]: {},
};
