import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import openChest from "#src/assets/dungeons/sound/openChest.mp3";
import openDoor from "#src/assets/dungeons/sound/openDoor.mp3";
import textBlip from "#src/assets/dungeons/sound/textBlip.mp3";
import claw from "#src/assets/dungeons/thirdParty/leohpaz/claw.mp3";
import flee from "#src/assets/dungeons/thirdParty/leohpaz/flee.mp3";
import iceExplosion from "#src/assets/dungeons/thirdParty/leohpaz/iceExplosion.mp3";
import stepGrass from "#src/assets/dungeons/thirdParty/leohpaz/stepGrass.mp3";

export const SoundEffectAssetMap = {
  [SoundEffectKey.Claw]: claw,
  [SoundEffectKey.Flee]: flee,
  [SoundEffectKey.IceExplosion]: iceExplosion,
  [SoundEffectKey.OpenChest]: openChest,
  [SoundEffectKey.OpenDoor]: openDoor,
  [SoundEffectKey.StepGrass]: stepGrass,
  [SoundEffectKey.TextBlip]: textBlip,
} as const satisfies Record<SoundEffectKey, string>;
