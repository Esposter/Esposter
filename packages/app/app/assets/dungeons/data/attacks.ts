import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const AttackMap = {
  // Weak filler shared across kits — the fallback when signature moves would overkill
  [AttackId.Bite]: {
    power: 30,
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId.Slash]: {
    power: 40,
    soundEffectKey: SoundEffectKey.Claw,
  },
  // Aquavalor's signature — high power compensates the tank's low attack stat
  [AttackId["Aqua Jet"]]: {
    power: 45,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  // Frostsaber's signature — the strongest attack, befitting the prize encounter
  [AttackId["Frost Fang"]]: {
    power: 60,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId["Ice Shard"]]: {
    power: 55,
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  // Carnodusk's signature — stacked on its high attack for burst damage
  [AttackId["Shadow Claw"]]: {
    power: 50,
    soundEffectKey: SoundEffectKey.Claw,
  },
  // Ignivolt's signature — the glass cannon's payoff move
  [AttackId["Volt Claw"]]: {
    power: 50,
    soundEffectKey: SoundEffectKey.Claw,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
