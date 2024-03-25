import character from "@/assets/dungeons/axulart/character/custom.png";
import npc from "@/assets/dungeons/parabellumGames/characters.png";
import { CharacterKey } from "@/models/dungeons/keys/spritesheet/CharacterKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const CharacterLoaderMap = {
  [CharacterKey.Character]: (scene) =>
    scene.load.spritesheet(CharacterKey.Character, character, { frameWidth: 64, frameHeight: 88 }),
  [CharacterKey.Npc]: (scene) => scene.load.spritesheet(CharacterKey.Npc, npc, { frameWidth: 16, frameHeight: 16 }),
} as const satisfies Record<CharacterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
