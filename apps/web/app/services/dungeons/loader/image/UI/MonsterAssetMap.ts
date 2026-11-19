import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import aquavalor from "#src/assets/dungeons/UI/monsters/aquavalor.png";
import carnodusk from "#src/assets/dungeons/UI/monsters/carnodusk.png";
import frostsaber from "#src/assets/dungeons/UI/monsters/frostsaber.png";
import ignivolt from "#src/assets/dungeons/UI/monsters/ignivolt.png";
import iguanignite from "#src/assets/dungeons/UI/monsters/iguanignite.png";

export const MonsterAssetMap = {
  [MonsterKey.Aquavalor]: aquavalor,
  [MonsterKey.Carnodusk]: carnodusk,
  [MonsterKey.Frostsaber]: frostsaber,
  [MonsterKey.Ignivolt]: ignivolt,
  [MonsterKey.Iguanignite]: iguanignite,
} as const satisfies Record<MonsterKey, string>;
