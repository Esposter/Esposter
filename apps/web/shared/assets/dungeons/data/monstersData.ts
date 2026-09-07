import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { Except } from "type-fest";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { BASE_DEFENSE } from "#shared/services/dungeons/monster/constants";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const MonstersDataMap = {
  // Tank: shrugs off hits but chips away slowly
  [FileKey.UIMonstersAquavalor]: {
    asset: {
      key: FileKey.UIMonstersAquavalor,
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
  [FileKey.UIMonstersCarnodusk]: {
    asset: {
      key: FileKey.UIMonstersCarnodusk,
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
  [FileKey.UIMonstersFrostsaber]: {
    asset: {
      key: FileKey.UIMonstersFrostsaber,
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
  [FileKey.UIMonstersIgnivolt]: {
    asset: {
      key: FileKey.UIMonstersIgnivolt,
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
  [FileKey.UIMonstersIguanignite]: {
    asset: {
      key: FileKey.UIMonstersIguanignite,
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
} as const satisfies Partial<Record<FileKey, Except<Monster, "id" | "key">>>;

export const monstersData: Except<Monster, "id">[] = parseDictionaryToArray(MonstersDataMap, "key");
