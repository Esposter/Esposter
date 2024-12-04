import type { Attack } from "@/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { AttackId } from "@/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

const AttackMap = {
  [AttackId.Slash]: {
    soundEffectKey: SoundEffectKey.Claw,
  },
  [AttackId["Ice Shard"]]: {
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
