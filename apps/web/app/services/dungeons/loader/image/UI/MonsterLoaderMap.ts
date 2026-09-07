import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import aquavalor from "@/assets/dungeons/UI/monsters/aquavalor.png";
import carnodusk from "@/assets/dungeons/UI/monsters/carnodusk.png";
import frostsaber from "@/assets/dungeons/UI/monsters/frostsaber.png";
import ignivolt from "@/assets/dungeons/UI/monsters/ignivolt.png";
import iguanignite from "@/assets/dungeons/UI/monsters/iguanignite.png";

export const MonsterLoaderMap = {
  [MonsterKey.Aquavalor]: (scene) => scene.load.image(MonsterKey.Aquavalor, aquavalor),
  [MonsterKey.Carnodusk]: (scene) => scene.load.image(MonsterKey.Carnodusk, carnodusk),
  [MonsterKey.Frostsaber]: (scene) => scene.load.image(MonsterKey.Frostsaber, frostsaber),
  [MonsterKey.Ignivolt]: (scene) => scene.load.image(MonsterKey.Ignivolt, ignivolt),
  [MonsterKey.Iguanignite]: (scene) => scene.load.image(MonsterKey.Iguanignite, iguanignite),
} as const satisfies Record<MonsterKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
