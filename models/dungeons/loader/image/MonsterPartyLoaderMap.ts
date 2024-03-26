import monsterPartyBackground from "@/assets/dungeons/monsterParty/background.png";
import monsterDetailsBackground from "@/assets/dungeons/monsterParty/monsterDetailsBackground.png";
import { MonsterPartyKey } from "@/models/dungeons/keys/image/MonsterPartyKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const MonsterPartyLoaderMap = {
  [MonsterPartyKey.MonsterDetailsBackground]: (scene) =>
    scene.load.image(MonsterPartyKey.MonsterDetailsBackground, monsterDetailsBackground),
  [MonsterPartyKey.MonsterPartyBackground]: (scene) =>
    scene.load.image(MonsterPartyKey.MonsterPartyBackground, monsterPartyBackground),
} as const satisfies Record<MonsterPartyKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
