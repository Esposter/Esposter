import iceAttackActive from "@/assets/dungeons/thirdParty/pimen/iceAttack/active.png";
import iceAttackStart from "@/assets/dungeons/thirdParty/pimen/iceAttack/start.png";
import slash from "@/assets/dungeons/thirdParty/pimen/slash.png";
import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const AttackLoaderMap = {
  [AttackKey["Ice Shard"]]: (scene) =>
    scene.load.spritesheet(AttackKey["Ice Shard"], iceAttackActive, { frameWidth: 32, frameHeight: 32 }),
  [AttackKey["Ice Shard Start"]]: (scene) =>
    scene.load.spritesheet(AttackKey["Ice Shard Start"], iceAttackStart, { frameWidth: 32, frameHeight: 32 }),
  [AttackKey.Slash]: (scene) => scene.load.spritesheet(AttackKey.Slash, slash, { frameWidth: 48, frameHeight: 48 }),
} as const satisfies Record<AttackKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
