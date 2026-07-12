import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { Except } from "type-fest";

import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { AssetKey } from "#shared/models/dungeons/keys/AssetKey";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const MonstersDataMap = {
  // Tank: shrugs off hits but chips away slowly
  [MonsterKey.Aquavalor]: {
    asset: {
      key: AssetKey.Aquavalor,
    },
    attackIds: [AttackId["Aqua Jet"], AttackId["Ice Shard"], AttackId.Bite],
    stats: {
      attack: 4,
      baseExp: 60,
      level: 5,
      maxHp: 40,
    },
    status: { exp: 0, hp: 40 },
  },
  // Fast and fragile: hits hard, folds fast
  [MonsterKey.Carnodusk]: {
    asset: {
      key: AssetKey.Carnodusk,
    },
    attackIds: [AttackId["Shadow Claw"], AttackId.Slash, AttackId.Bite],
    stats: {
      attack: 8,
      baseExp: 62,
      level: 5,
      maxHp: 18,
    },
    status: { exp: 0, hp: 18 },
  },
  // Rare and strong on both axes — the prize encounter
  [MonsterKey.Frostsaber]: {
    asset: {
      key: AssetKey.Frostsaber,
    },
    attackIds: [AttackId["Frost Fang"], AttackId["Ice Shard"], AttackId.Slash],
    stats: {
      attack: 7,
      baseExp: 70,
      level: 5,
      maxHp: 30,
    },
    status: { exp: 0, hp: 30 },
  },
  // Glass cannon: strong attack, thin health pool
  [MonsterKey.Ignivolt]: {
    asset: {
      key: AssetKey.Ignivolt,
    },
    attackIds: [AttackId["Volt Claw"], AttackId.Slash, AttackId.Bite],
    stats: {
      attack: 7,
      baseExp: 58,
      level: 5,
      maxHp: 20,
    },
    status: { exp: 0, hp: 20 },
  },
  // Balanced starter
  [MonsterKey.Iguanignite]: {
    asset: {
      key: AssetKey.Iguanignite,
    },
    attackIds: [AttackId.Slash, AttackId.Bite],
    stats: {
      attack: 6,
      baseExp: 55,
      level: 5,
      maxHp: 25,
    },
    status: { exp: 0, hp: 25 },
  },
} as const satisfies Record<MonsterKey, Except<Monster, "id" | "key">>;

export const monstersData: Except<Monster, "id">[] = parseDictionaryToArray(MonstersDataMap, "key");
