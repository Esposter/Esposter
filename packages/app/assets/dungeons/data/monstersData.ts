import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import type { Except } from "type-fest";

const MonstersDataMap = {
  [MonsterKey.Aquavalor]: {
    asset: {
      key: AssetKey.Aquavalor,
    },
    stats: {
      maxHp: 25,
      attack: 5,
      exp: 50,
    },
    status: { level: 5, hp: 25, exp: 125 },
    attackIds: [AttackId["Ice Shard"]],
  },
  [MonsterKey.Carnodusk]: {
    asset: {
      key: AssetKey.Carnodusk,
    },
    stats: {
      maxHp: 25,
      attack: 5,
      exp: 52,
    },
    status: { level: 5, hp: 25, exp: 125 },
    attackIds: [AttackId["Ice Shard"]],
  },
  [MonsterKey.Frostsaber]: {
    asset: {
      key: AssetKey.Frostsaber,
    },
    stats: {
      maxHp: 25,
      attack: 5,
      exp: 53,
    },
    status: { level: 5, hp: 25, exp: 125 },
    attackIds: [AttackId["Ice Shard"]],
  },
  [MonsterKey.Ignivolt]: {
    asset: {
      key: AssetKey.Ignivolt,
    },
    stats: {
      maxHp: 25,
      attack: 5,
      exp: 51,
    },
    status: { level: 5, hp: 25, exp: 125 },
    attackIds: [AttackId["Ice Shard"]],
  },
  [MonsterKey.Iguanignite]: {
    asset: {
      key: AssetKey.Iguanignite,
    },
    stats: {
      maxHp: 25,
      attack: 5,
      exp: 50,
    },
    status: { level: 5, hp: 25, exp: 125 },
    attackIds: [AttackId.Slash],
  },
} as const satisfies Record<MonsterKey, Except<Monster, "id" | "key">>;

export const monstersData: Except<Monster, "id">[] = parseDictionaryToArray(MonstersDataMap, "key");
