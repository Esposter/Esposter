import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import openChest from "#src/assets/dungeons/sound/openChest.mp3";
import openDoor from "#src/assets/dungeons/sound/openDoor.mp3";
import textBlip from "#src/assets/dungeons/sound/textBlip.mp3";
import claw from "#src/assets/dungeons/thirdParty/leohpaz/claw.wav";
import flee from "#src/assets/dungeons/thirdParty/leohpaz/flee.wav";
import iceExplosion from "#src/assets/dungeons/thirdParty/leohpaz/iceExplosion.wav";
import stepGrass from "#src/assets/dungeons/thirdParty/leohpaz/stepGrass.wav";

export const SoundEffectLoaderMap = {
  [SoundEffectKey.Claw]: (scene) => scene.load.audio(SoundEffectKey.Claw, claw),
  [SoundEffectKey.Flee]: (scene) => scene.load.audio(SoundEffectKey.Flee, flee),
  [SoundEffectKey.IceExplosion]: (scene) => scene.load.audio(SoundEffectKey.IceExplosion, iceExplosion),
  [SoundEffectKey.OpenChest]: (scene) => scene.load.audio(SoundEffectKey.OpenChest, openChest),
  [SoundEffectKey.OpenDoor]: (scene) => scene.load.audio(SoundEffectKey.OpenDoor, openDoor),
  [SoundEffectKey.StepGrass]: (scene) => scene.load.audio(SoundEffectKey.StepGrass, stepGrass),
  [SoundEffectKey.TextBlip]: (scene) => scene.load.audio(SoundEffectKey.TextBlip, textBlip),
} as const satisfies Record<SoundEffectKey, AssetLoader>;
