import character from "@/assets/dungeons/axulart/character/custom.png";
import npc from "@/assets/dungeons/parabellumGames/characters.png";
import iceAttackActive from "@/assets/dungeons/pimen/iceAttack/active.png";
import iceAttackStart from "@/assets/dungeons/pimen/iceAttack/start.png";
import slash from "@/assets/dungeons/pimen/slash.png";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Loader } from "phaser";

export const SpritesheetLoaderMap: Record<SpritesheetKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [SpritesheetKey.IceShard]: (scene) =>
    scene.load.spritesheet(SpritesheetKey.IceShard, iceAttackActive, { frameWidth: 32, frameHeight: 32 }),
  [SpritesheetKey.IceShardStart]: (scene) =>
    scene.load.spritesheet(SpritesheetKey.IceShardStart, iceAttackStart, { frameWidth: 32, frameHeight: 32 }),
  [SpritesheetKey.Slash]: (scene) =>
    scene.load.spritesheet(SpritesheetKey.Slash, slash, { frameWidth: 48, frameHeight: 48 }),

  [SpritesheetKey.Character]: (scene) =>
    scene.load.spritesheet(SpritesheetKey.Character, character, { frameWidth: 64, frameHeight: 88 }),
  [SpritesheetKey.Npc]: (scene) => scene.load.spritesheet(SpritesheetKey.Npc, npc, { frameWidth: 16, frameHeight: 16 }),
};
