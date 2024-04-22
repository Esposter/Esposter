import type { Attack } from "@/models/dungeons/attack/Attack";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";

export const attacks: Attack[] = [
  {
    id: AttackId["Ice Shard"],
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  {
    id: AttackId.Slash,
    soundEffectKey: SoundEffectKey.Claw,
  },
];
