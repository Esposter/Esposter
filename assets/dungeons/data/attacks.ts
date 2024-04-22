import type { Attack } from "@/models/dungeons/attack/Attack";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseAttacks: Except<Attack, "name">[] = [
  {
    id: AttackId.IceShard,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  {
    id: AttackId.Slash,
    soundEffectKey: SoundEffectKey.Claw,
  },
];

export const attacks: Attack[] = baseAttacks.map((ba) => ({
  ...ba,
  name: prettifyName(ba.id),
}));
