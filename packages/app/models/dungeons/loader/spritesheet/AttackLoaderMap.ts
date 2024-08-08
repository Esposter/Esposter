import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

import iceAttackActive from "@/assets/dungeons/thirdParty/pimen/iceAttack/active.png";
import iceAttackStart from "@/assets/dungeons/thirdParty/pimen/iceAttack/start.png";
import slash from "@/assets/dungeons/thirdParty/pimen/slash.png";
import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";

export const AttackLoaderMap = {
  [AttackKey.Slash]: (scene) => scene.load.spritesheet(AttackKey.Slash, slash, { frameHeight: 48, frameWidth: 48 }),
  [AttackKey["Ice Shard Start"]]: (scene) =>
    scene.load.spritesheet(AttackKey["Ice Shard Start"], iceAttackStart, { frameHeight: 32, frameWidth: 32 }),
  [AttackKey["Ice Shard"]]: (scene) =>
    scene.load.spritesheet(AttackKey["Ice Shard"], iceAttackActive, { frameHeight: 32, frameWidth: 32 }),
} as const satisfies Record<AttackKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
