import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";

export interface Attack {
  id: AttackId;
  power: number;
  soundEffectKey: SoundEffectKey;
}
