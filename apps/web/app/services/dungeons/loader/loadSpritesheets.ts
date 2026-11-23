import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { SceneWithPlugins } from "vue-phaserjs";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { AttackKey } from "#shared/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "#shared/models/dungeons/keys/spritesheet/CharacterKey";
import { getDungeonsUrl } from "#src/services/dungeons/loader/getDungeonsUrl";

// Each spritesheet's file and the size of one frame in it, under the key the characters and attacks draw it by
const SPRITESHEET_CONFIGURATIONS = {
  [AttackKey.Slash]: { fileKey: DungeonsKeys.ThirdPartyPimenSlash, frameHeight: 48, frameWidth: 48 },
  [AttackKey["Ice Shard"]]: { fileKey: DungeonsKeys.ThirdPartyPimenIceAttackActive, frameHeight: 32, frameWidth: 32 },
  [AttackKey["Ice Shard Start"]]: {
    fileKey: DungeonsKeys.ThirdPartyPimenIceAttackStart,
    frameHeight: 32,
    frameWidth: 32,
  },
  [CharacterKey.Character]: { fileKey: DungeonsKeys.ThirdPartyAxulartCharacterCustom, frameHeight: 88, frameWidth: 64 },
  [CharacterKey.Npc]: { fileKey: DungeonsKeys.ThirdPartyParabellumGamesCharacters, frameHeight: 16, frameWidth: 16 },
} as const satisfies Record<
  AttackKey | CharacterKey,
  { fileKey: DungeonsKey; frameHeight: number; frameWidth: number }
>;

export const loadSpritesheets = (scene: SceneWithPlugins, origin: string) => {
  for (const [key, { fileKey, frameHeight, frameWidth }] of Object.entries(SPRITESHEET_CONFIGURATIONS))
    scene.load.spritesheet(key, getDungeonsUrl(origin, fileKey), { frameHeight, frameWidth });
};
