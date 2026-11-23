import type { Attack } from "#src/models/dungeons/attack/Attack";
import type { Except } from "type-fest";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { AttackId } from "#shared/models/dungeons/attack/AttackId";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const AttackMap = {
  // Weak filler shared across kits — the fallback when signature moves would overkill
  [AttackId.Bite]: { fileKey: DungeonsKeys.ThirdPartyLeohpazClaw, power: 30 },
  [AttackId.Slash]: { fileKey: DungeonsKeys.ThirdPartyLeohpazClaw, power: 40 },
  // Aquavalor's signature — high power compensates the tank's low attack stat
  [AttackId["Aqua Jet"]]: { fileKey: DungeonsKeys.ThirdPartyLeohpazIceExplosion, power: 45 },
  // Frostsaber's signature — the strongest attack, befitting the prize encounter
  [AttackId["Frost Fang"]]: { fileKey: DungeonsKeys.ThirdPartyLeohpazIceExplosion, power: 60 },
  [AttackId["Ice Shard"]]: { fileKey: DungeonsKeys.ThirdPartyLeohpazIceExplosion, power: 55 },
  // Carnodusk's signature — stacked on its high attack for burst damage
  [AttackId["Shadow Claw"]]: { fileKey: DungeonsKeys.ThirdPartyLeohpazClaw, power: 50 },
  // Ignivolt's signature — the glass cannon's payoff move
  [AttackId["Volt Claw"]]: { fileKey: DungeonsKeys.ThirdPartyLeohpazClaw, power: 50 },
} as const satisfies Record<AttackId, Except<Attack, "id">>;

export const attacks: Attack[] = parseDictionaryToArray(AttackMap);
