import type { Attack } from "@/models/dungeons/attack/Attack";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import type { Except } from "type-fest";

const AttackMap = {
  [AttackId["Ice Shard"]]: {
    soundEffectKey: SoundEffectKey.IceExplosion,
  },
  [AttackId.Slash]: {
    soundEffectKey: SoundEffectKey.Claw,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
