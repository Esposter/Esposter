import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";

// A species' portrait is looked up rather than saved on each monster: the species decides it, so a save holds no texture
export const MonsterKeyFileKeyMap = {
  [MonsterKey.Aquavalor]: DungeonsKeys.UIMonstersAquavalor,
  [MonsterKey.Carnodusk]: DungeonsKeys.UIMonstersCarnodusk,
  [MonsterKey.Frostsaber]: DungeonsKeys.UIMonstersFrostsaber,
  [MonsterKey.Ignivolt]: DungeonsKeys.UIMonstersIgnivolt,
  [MonsterKey.Iguanignite]: DungeonsKeys.UIMonstersIguanignite,
} as const satisfies Record<MonsterKey, DungeonsKey>;
