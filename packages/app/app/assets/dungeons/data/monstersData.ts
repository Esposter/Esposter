import type { Monster } from "@/models/dungeons/monster/Monster";
import type { Except } from "type-fest";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

const MonstersDataMap = {
  [FileKey.UIMonstersAquavalor]: {
    asset: {
      key: FileKey.UIMonstersAquavalor,
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
  [FileKey.UIMonstersCarnodusk]: {
    asset: {
      key: FileKey.UIMonstersCarnodusk,
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
  [FileKey.UIMonstersFrostsaber]: {
    asset: {
      key: FileKey.UIMonstersFrostsaber,
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
  [FileKey.UIMonstersIgnivolt]: {
    asset: {
      key: FileKey.UIMonstersIgnivolt,
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
  [FileKey.UIMonstersIguanignite]: {
    asset: {
      key: FileKey.UIMonstersIguanignite,
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
} as const satisfies Partial<Record<FileKey, Except<Monster, "id" | "key">>>;

export const monstersData: Except<Monster, "id">[] = parseDictionaryToArray(MonstersDataMap, "key");
