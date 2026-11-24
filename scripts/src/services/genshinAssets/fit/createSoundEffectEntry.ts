import type { RunFitEntry } from "#src/models/genshinAssets/fit/RunFitEntry";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SoundEffect } from "genshin-engine";

import { fitSoundEffect } from "#src/services/genshinAssets/fit/fitSoundEffect";
import { DerivedAssetSoundEffectMap } from "#src/services/genshinAssets/sound/DerivedAssetSoundEffectMap";

// A component's sound effects, each fitted from the game's sounds matched for it, as its record `<component>/sounds`. A
// Component with none mapped is opt-in, so an ordinary run leaves its empty record out and a run that names it
// Publishes the record its map holds
export const createSoundEffectEntry = (component: DerivedAssetComponent): RunFitEntry => {
  const effects = DerivedAssetSoundEffectMap[component];
  return [
    "sounds",
    async () => {
      const fitted: Record<string, SoundEffect> = {};
      for (const [name, { pattern, sounds }] of Object.entries(effects))
        /* oxlint-disable-next-line no-await-in-loop -- One device: each effect's sounds are decoded through one
           vgmstream run at a time into one shared folder, in turn */
        fitted[name] = await fitSoundEffect(pattern, sounds);
      return { notes: [], objects: { [`${component}/sounds`]: fitted } };
    },
    { isOptIn: Object.keys(effects).length === 0 },
  ];
};
