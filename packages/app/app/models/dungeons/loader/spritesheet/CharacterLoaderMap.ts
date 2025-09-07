import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { CharacterKey } from "#shared/models/dungeons/keys/spritesheet/CharacterKey";
import character from "@/assets/dungeons/thirdParty/axulart/character/custom.png";
import npc from "@/assets/dungeons/thirdParty/parabellumGames/characters.png";

export const CharacterLoaderMap = {
  [CharacterKey.Character]: (scene) =>
    scene.load.spritesheet(CharacterKey.Character, character, { frameHeight: 88, frameWidth: 64 }),
  [CharacterKey.Npc]: (scene) => scene.load.spritesheet(CharacterKey.Npc, npc, { frameHeight: 16, frameWidth: 16 }),
} as const satisfies Record<CharacterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
