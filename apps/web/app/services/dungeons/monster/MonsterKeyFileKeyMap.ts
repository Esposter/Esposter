import { FileKey } from "#shared/generated/phaser/FileKey";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";

// A species' portrait, looked up rather than saved on each monster: the species decides it, and the bucket's layout
// Can move a file without touching a save
export const MonsterKeyFileKeyMap = {
  [MonsterKey.Aquavalor]: FileKey.UIMonstersAquavalor,
  [MonsterKey.Carnodusk]: FileKey.UIMonstersCarnodusk,
  [MonsterKey.Frostsaber]: FileKey.UIMonstersFrostsaber,
  [MonsterKey.Ignivolt]: FileKey.UIMonstersIgnivolt,
  [MonsterKey.Iguanignite]: FileKey.UIMonstersIguanignite,
} as const satisfies Record<MonsterKey, FileKey>;
