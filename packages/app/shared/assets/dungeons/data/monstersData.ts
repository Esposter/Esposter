import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { Except } from "type-fest";

import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { AssetKey } from "#shared/models/dungeons/keys/AssetKey";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { BASE_DEFENSE } from "#shared/services/dungeons/monster/constants";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const MonstersDataMap = {
  // Tank: shrugs off hits but chips away slowly
  [MonsterKey.Aquavalor]: {
    asset: {
      key: AssetKey.Aquavalor,
    },
    attackIds: [AttackId["Aqua Jet"], AttackId["Ice Shard"], AttackId.Bite],
    statistics: {
      attack: 4,
      baseExperience: 60,
      defense: 8,
      level: 5,
      maxHealth: 40,
    },
    status: { experience: 0, health: 40 },
  },
  // Fast and fragile: hits hard, folds fast
  [MonsterKey.Carnodusk]: {
    asset: {
      key: AssetKey.Carnodusk,
    },
    attackIds: [AttackId["Shadow Claw"], AttackId.Slash, AttackId.Bite],
    statistics: {
      attack: 8,
      baseExperience: 62,
      defense: 3,
      level: 5,
      maxHealth: 18,
    },
    status: { experience: 0, health: 18 },
  },
  // Rare and strong on both axes — the prize encounter
  [MonsterKey.Frostsaber]: {
    asset: {
      key: AssetKey.Frostsaber,
    },
    attackIds: [AttackId["Frost Fang"], AttackId["Ice Shard"], AttackId.Slash],
    statistics: {
      attack: 7,
      baseExperience: 70,
      defense: 7,
      level: 5,
      maxHealth: 30,
    },
    status: { experience: 0, health: 30 },
  },
  // Glass cannon: strong attack, thin health pool
  [MonsterKey.Ignivolt]: {
    asset: {
      key: AssetKey.Ignivolt,
    },
    attackIds: [AttackId["Volt Claw"], AttackId.Slash, AttackId.Bite],
    statistics: {
      attack: 7,
      baseExperience: 58,
      defense: 4,
      level: 5,
      maxHealth: 20,
    },
    status: { experience: 0, health: 20 },
  },
  // Balanced starter
  [MonsterKey.Iguanignite]: {
    asset: {
      key: AssetKey.Iguanignite,
    },
    attackIds: [AttackId.Slash, AttackId.Bite],
    statistics: {
      attack: 6,
      baseExperience: 55,
      defense: BASE_DEFENSE,
      level: 5,
      maxHealth: 25,
    },
    status: { experience: 0, health: 25 },
  },
} as const satisfies Record<MonsterKey, Except<Monster, "id" | "key">>;

export const monstersData: Except<Monster, "id">[] = parseDictionaryToArray(MonstersDataMap, "key");
