import { FileKey } from "#shared/generated/phaser/FileKey";
import aquavalor from "#src/assets/dungeons/UI/monsters/aquavalor.png";
import carnodusk from "#src/assets/dungeons/UI/monsters/carnodusk.png";
import frostsaber from "#src/assets/dungeons/UI/monsters/frostsaber.png";
import ignivolt from "#src/assets/dungeons/UI/monsters/ignivolt.png";
import iguanignite from "#src/assets/dungeons/UI/monsters/iguanignite.png";

export const MonsterAssetMap = {
  [FileKey.UIMonstersAquavalor]: aquavalor,
  [FileKey.UIMonstersCarnodusk]: carnodusk,
  [FileKey.UIMonstersFrostsaber]: frostsaber,
  [FileKey.UIMonstersIgnivolt]: ignivolt,
  [FileKey.UIMonstersIguanignite]: iguanignite,
} as const satisfies Partial<Record<FileKey, string>>;
