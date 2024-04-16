import aquavalor from "@/assets/dungeons/battle/monsters/aquavalor.png";
import carnodusk from "@/assets/dungeons/battle/monsters/carnodusk.png";
import frostsaber from "@/assets/dungeons/battle/monsters/frostsaber.png";
import ignivolt from "@/assets/dungeons/battle/monsters/ignivolt.png";
import iguanignite from "@/assets/dungeons/battle/monsters/iguanignite.png";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const MonsterLoaderMap: Record<MonsterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [MonsterKey.Aquavalor]: (scene) => scene.load.image(MonsterKey.Aquavalor, aquavalor),
  [MonsterKey.Carnodusk]: (scene) => scene.load.image(MonsterKey.Carnodusk, carnodusk),
  [MonsterKey.Frostsaber]: (scene) => scene.load.image(MonsterKey.Frostsaber, frostsaber),
  [MonsterKey.Ignivolt]: (scene) => scene.load.image(MonsterKey.Ignivolt, ignivolt),
  [MonsterKey.Iguanignite]: (scene) => scene.load.image(MonsterKey.Iguanignite, iguanignite),
} as const satisfies Record<MonsterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
