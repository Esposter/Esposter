import iceAttackActive from "@/assets/dungeons/pimen/iceAttack/active.png";
import iceAttackStart from "@/assets/dungeons/pimen/iceAttack/start.png";
import slash from "@/assets/dungeons/pimen/slash.png";
import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const AttackLoaderMap = {
  [AttackKey.IceShard]: (scene) =>
    scene.load.spritesheet(AttackKey.IceShard, iceAttackActive, { frameWidth: 32, frameHeight: 32 }),
  [AttackKey.IceShardStart]: (scene) =>
    scene.load.spritesheet(AttackKey.IceShardStart, iceAttackStart, { frameWidth: 32, frameHeight: 32 }),
  [AttackKey.Slash]: (scene) => scene.load.spritesheet(AttackKey.Slash, slash, { frameWidth: 48, frameHeight: 48 }),
} as const satisfies Record<AttackKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
