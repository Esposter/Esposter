import type { SpritesheetAsset } from "#src/models/dungeons/loader/SpritesheetAsset";

import { CharacterKey } from "#shared/models/dungeons/keys/spritesheet/CharacterKey";
import character from "#src/assets/dungeons/thirdParty/axulart/character/custom.png";
import npc from "#src/assets/dungeons/thirdParty/parabellumGames/characters.png";

export const CharacterAssetMap = {
  [CharacterKey.Character]: { frameHeight: 88, frameWidth: 64, url: character },
  [CharacterKey.Npc]: { frameHeight: 16, frameWidth: 16, url: npc },
} as const satisfies Record<CharacterKey, SpritesheetAsset>;
