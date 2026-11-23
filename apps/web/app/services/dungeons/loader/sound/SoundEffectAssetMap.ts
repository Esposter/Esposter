import type { AudioFileKey } from "#shared/generated/phaser/FileKey";

import { FileKey } from "#shared/generated/phaser/FileKey";
import openChest from "#src/assets/dungeons/sound/openChest.mp3";
import openDoor from "#src/assets/dungeons/sound/openDoor.mp3";
import textBlip from "#src/assets/dungeons/sound/textBlip.mp3";
import claw from "#src/assets/dungeons/thirdParty/leohpaz/claw.mp3";
import flee from "#src/assets/dungeons/thirdParty/leohpaz/flee.mp3";
import iceExplosion from "#src/assets/dungeons/thirdParty/leohpaz/iceExplosion.mp3";
import stepGrass from "#src/assets/dungeons/thirdParty/leohpaz/stepGrass.mp3";

export const SoundEffectAssetMap = {
  [FileKey.SoundOpenChest]: openChest,
  [FileKey.SoundOpenDoor]: openDoor,
  [FileKey.SoundTextBlip]: textBlip,
  [FileKey.ThirdPartyLeohpazClaw]: claw,
  [FileKey.ThirdPartyLeohpazFlee]: flee,
  [FileKey.ThirdPartyLeohpazIceExplosion]: iceExplosion,
  [FileKey.ThirdPartyLeohpazStepGrass]: stepGrass,
} as const satisfies Partial<Record<AudioFileKey, string>>;
