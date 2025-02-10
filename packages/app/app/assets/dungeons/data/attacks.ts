import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";

const AttackMap = {
  [AttackId.Slash]: {
    fileKey: FileKey.ThirdPartyLeohpazClaw,
  },
  [AttackId["Ice Shard"]]: {
    fileKey: FileKey.ThirdPartyLeohpazIceExplosion,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
