import { AttackId } from "@/models/dungeons/attack/AttackId";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseMonsters: Except<Monster, "id" | "name">[] = [
  {
    monsterName: MonsterName.Aquavalor,
    asset: {
      key: ImageKey.Aquavalor,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.IceShard],
  },
  {
    monsterName: MonsterName.Carnodusk,
    asset: {
      key: ImageKey.Carnodusk,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.IceShard],
  },
  {
    monsterName: MonsterName.Frostsaber,
    asset: {
      key: ImageKey.Frostsaber,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.IceShard],
  },
  {
    monsterName: MonsterName.Ignivolt,
    asset: {
      key: ImageKey.Ignivolt,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.IceShard],
  },
  {
    monsterName: MonsterName.Iguanignite,
    asset: {
      key: ImageKey.Iguanignite,
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

export const monsters: Except<Monster, "id">[] = baseMonsters.map((ba) => ({
  ...ba,
  name: prettifyName(ba.monsterName),
}));
