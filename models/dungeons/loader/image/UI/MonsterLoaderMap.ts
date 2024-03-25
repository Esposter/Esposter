import carnodusk from "@/assets/dungeons/battle/monsters/carnodusk.png";
import iguanignite from "@/assets/dungeons/battle/monsters/iguanignite.png";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const MonsterLoaderMap: Record<MonsterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [MonsterKey.Carnodusk]: (scene) => scene.load.image(MonsterKey.Carnodusk, carnodusk),
  [MonsterKey.Iguanignite]: (scene) => scene.load.image(MonsterKey.Iguanignite, iguanignite),
} as const satisfies Record<MonsterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
