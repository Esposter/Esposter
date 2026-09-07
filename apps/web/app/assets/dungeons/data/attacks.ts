import type { Attack } from "@/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const AttackMap = {
  // Weak filler shared across kits — the fallback when signature moves would overkill
  [AttackId.Bite]: { power: 30, fileKey: FileKey.ThirdPartyLeohpazClaw },
  [AttackId.Slash]: { power: 40, fileKey: FileKey.ThirdPartyLeohpazClaw },
  // Aquavalor's signature — high power compensates the tank's low attack stat
  [AttackId["Aqua Jet"]]: { power: 45, fileKey: FileKey.ThirdPartyLeohpazIceExplosion },
  // Frostsaber's signature — the strongest attack, befitting the prize encounter
  [AttackId["Frost Fang"]]: { power: 60, fileKey: FileKey.ThirdPartyLeohpazIceExplosion },
  [AttackId["Ice Shard"]]: { power: 55, fileKey: FileKey.ThirdPartyLeohpazIceExplosion },
  // Carnodusk's signature — stacked on its high attack for burst damage
  [AttackId["Shadow Claw"]]: { power: 50, fileKey: FileKey.ThirdPartyLeohpazClaw },
  // Ignivolt's signature — the glass cannon's payoff move
  [AttackId["Volt Claw"]]: { power: 50, fileKey: FileKey.ThirdPartyLeohpazClaw },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
