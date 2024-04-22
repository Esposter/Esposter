import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseMonstersDetails: Except<Monster, "id" | "name">[] = [
  {
    key: MonsterKey.Aquavalor,
    asset: {
      key: ImageKey.Aquavalor,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackKey.IceShard],
  },
  {
    key: MonsterKey.Carnodusk,
    asset: {
      key: ImageKey.Carnodusk,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackKey.IceShard],
  },
  {
    key: MonsterKey.Frostsaber,
    asset: {
      key: ImageKey.Frostsaber,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackKey.IceShard],
  },
  {
    key: MonsterKey.Ignivolt,
    asset: {
      key: ImageKey.Ignivolt,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackKey.IceShard],
  },
  {
    key: MonsterKey.Iguanignite,
    asset: {
      key: ImageKey.Iguanignite,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackKey.Slash],
  },
];

export const monstersDetails: Except<Monster, "id">[] = baseMonstersDetails.map((bmd) => ({
  ...bmd,
  name: prettifyName(bmd.key),
}));
