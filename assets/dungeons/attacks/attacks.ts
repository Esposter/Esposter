import { type Attack } from "@/models/dungeons/attack/Attack";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AnimationKey } from "@/models/dungeons/keys/AnimationKey";
import { prettifyName } from "@/util/text/prettifyName";
import { type Except } from "@/util/types/Except";

const baseAttacks: Except<Attack, "name" | "animation">[] = [
  {
    id: AttackId.IceShard,
  },
  {
    id: AttackId.Slash,
  },
];

export const attacks: Attack[] = baseAttacks.map((ba) => ({
  ...ba,
  name: prettifyName(ba.id),
  animation: {
    key: AnimationKey[ba.id],
  },
}));
