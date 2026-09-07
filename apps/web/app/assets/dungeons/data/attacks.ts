import type { Attack } from "#shared/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const AttackMap = {
  // Weak filler shared across kits — the fallback when signature moves would overkill
  [AttackId.Bite]: {
    fileKey: FileKey.ThirdPartyLeohpazClaw,
    power: 30,
  },
  [AttackId.Slash]: {
    fileKey: FileKey.ThirdPartyLeohpazClaw,
    power: 40,
  },
  // Aquavalor's signature — high power compensates the tank's low attack stat
  [AttackId["Aqua Jet"]]: {
    fileKey: FileKey.ThirdPartyLeohpazIceExplosion,
    power: 45,
  },
  // Frostsaber's signature — the strongest attack, befitting the prize encounter
  [AttackId["Frost Fang"]]: {
    fileKey: FileKey.ThirdPartyLeohpazIceExplosion,
    power: 60,
  },
  [AttackId["Ice Shard"]]: {
    fileKey: FileKey.ThirdPartyLeohpazIceExplosion,
    power: 55,
  },
  // Carnodusk's signature — stacked on its high attack for burst damage
  [AttackId["Shadow Claw"]]: {
    fileKey: FileKey.ThirdPartyLeohpazClaw,
    power: 50,
  },
  // Ignivolt's signature — the glass cannon's payoff move
  [AttackId["Volt Claw"]]: {
    fileKey: FileKey.ThirdPartyLeohpazClaw,
    power: 50,
  },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
