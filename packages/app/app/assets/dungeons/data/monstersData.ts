import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { Except } from "type-fest";

import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

const MonstersDataMap = {
  [MonsterKey.Aquavalor]: {
    asset: {
      key: AssetKey.Aquavalor,
    },
    attackIds: [AttackId["Ice Shard"]],
    stats: {
      attack: 5,
      baseExp: 50,
      level: 5,
      maxHp: 25,
    },
    status: { exp: 0, hp: 25 },
  },
  [MonsterKey.Carnodusk]: {
    asset: {
      key: AssetKey.Carnodusk,
    },
    attackIds: [AttackId["Ice Shard"]],
    stats: {
      attack: 5,
      baseExp: 52,
      level: 5,
      maxHp: 25,
    },
    status: { exp: 0, hp: 25 },
  },
  [MonsterKey.Frostsaber]: {
    asset: {
      key: AssetKey.Frostsaber,
    },
    attackIds: [AttackId["Ice Shard"]],
    stats: {
      attack: 5,
      baseExp: 53,
      level: 5,
      maxHp: 25,
    },
    status: { exp: 0, hp: 25 },
  },
  [MonsterKey.Ignivolt]: {
    asset: {
      key: AssetKey.Ignivolt,
    },
    attackIds: [AttackId["Ice Shard"]],
    stats: {
      attack: 5,
      baseExp: 51,
      level: 5,
      maxHp: 25,
    },
    status: { exp: 0, hp: 25 },
  },
  [MonsterKey.Iguanignite]: {
    asset: {
      key: AssetKey.Iguanignite,
    },
    attackIds: [AttackId.Slash],
    stats: {
      attack: 5,
      baseExp: 50,
      level: 5,
      maxHp: 25,
    },
    status: { exp: 0, hp: 25 },
  },
} as const satisfies Record<MonsterKey, Except<Monster, "id" | "key">>;

export const monstersData: Except<Monster, "id">[] = parseDictionaryToArray(MonstersDataMap, "key");
