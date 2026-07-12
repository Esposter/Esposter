import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const AttackMap = {
  [AttackId["Aqua Jet"]]: {
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId.Bite]: {
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId["Frost Fang"]]: {
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId["Ice Shard"]]: {
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId["Shadow Claw"]]: {
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId.Slash]: {
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId["Volt Claw"]]: {
    soundEffectKey: SoundEffectKey.Claw,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
