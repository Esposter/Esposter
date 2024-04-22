import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { Except } from "@/util/types/Except";

export const monstersDetails: Except<Monster, "id">[] = [
  {
    key: MonsterKey.Aquavalor,
    asset: {
      key: AssetKey.Aquavalor,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId["Ice Shard"]],
  },
  {
    key: MonsterKey.Carnodusk,
    asset: {
      key: AssetKey.Carnodusk,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId["Ice Shard"]],
  },
  {
    key: MonsterKey.Frostsaber,
    asset: {
      key: AssetKey.Frostsaber,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId["Ice Shard"]],
  },
  {
    key: MonsterKey.Ignivolt,
    asset: {
      key: AssetKey.Ignivolt,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId["Ice Shard"]],
  },
  {
    key: MonsterKey.Iguanignite,
    asset: {
      key: AssetKey.Iguanignite,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.Slash],
  },
];
