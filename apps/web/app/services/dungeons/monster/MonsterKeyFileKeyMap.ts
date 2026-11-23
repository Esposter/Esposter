import { FileKey } from "#shared/generated/phaser/FileKey";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";

// A species' portrait is looked up rather than saved on each monster: the species decides it, so a save holds no texture
export const MonsterKeyFileKeyMap = {
  [MonsterKey.Aquavalor]: FileKey.UIMonstersAquavalor,
  [MonsterKey.Carnodusk]: FileKey.UIMonstersCarnodusk,
  [MonsterKey.Frostsaber]: FileKey.UIMonstersFrostsaber,
  [MonsterKey.Ignivolt]: FileKey.UIMonstersIgnivolt,
  [MonsterKey.Iguanignite]: FileKey.UIMonstersIguanignite,
} as const satisfies Record<MonsterKey, FileKey>;
