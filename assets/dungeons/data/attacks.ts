import type { Attack } from "@/models/dungeons/attack/Attack";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseAttacks: Except<Attack, "name">[] = [
  {
    id: AttackKey.IceShard,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  {
    id: AttackKey.Slash,
    soundEffectKey: SoundEffectKey.Claw,
  },
];

export const attacks: Attack[] = baseAttacks.map((ba) => ({
  ...ba,
  name: prettifyName(ba.id),
}));
