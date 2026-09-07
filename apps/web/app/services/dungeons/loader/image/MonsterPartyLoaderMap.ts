import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { MonsterPartyKey } from "#shared/models/dungeons/keys/image/MonsterPartyKey";
import monsterPartyBackground from "@/assets/dungeons/scene/monsterParty/background.png";
import monsterDetailsBackground from "@/assets/dungeons/scene/monsterParty/monsterDetailsBackground.png";

export const MonsterPartyLoaderMap = {
  [MonsterPartyKey.MonsterDetailsBackground]: (scene) =>
    scene.load.image(MonsterPartyKey.MonsterDetailsBackground, monsterDetailsBackground),
  [MonsterPartyKey.MonsterPartyBackground]: (scene) =>
    scene.load.image(MonsterPartyKey.MonsterPartyBackground, monsterPartyBackground),
} as const satisfies Record<MonsterPartyKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
