import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseMonstersDetails: Except<Monster, "id" | "name">[] = [
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
    attackIds: [AttackId.IceShard],
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
    attackIds: [AttackId.IceShard],
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
    attackIds: [AttackId.IceShard],
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
    attackIds: [AttackId.IceShard],
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

export const monstersDetails: Except<Monster, "id">[] = baseMonstersDetails.map((bmd) => ({
  ...bmd,
  name: prettifyName(bmd.key),
}));
