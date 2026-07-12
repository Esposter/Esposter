import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const AttackMap = {
  [AttackId["Aqua Jet"]]: {
    power: 40,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId.Bite]: {
    power: 30,
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId["Frost Fang"]]: {
    power: 50,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId["Ice Shard"]]: {
    power: 55,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId["Shadow Claw"]]: {
    power: 45,
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId.Slash]: {
    power: 40,
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId["Volt Claw"]]: {
    power: 45,
    soundEffectKey: SoundEffectKey.Claw,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
