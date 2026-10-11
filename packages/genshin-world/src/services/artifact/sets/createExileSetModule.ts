import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const EXILE_FIELD_ID = "exile";
// Measured: the wiki's The Exile, its energy every 2 seconds, the first tick 2 seconds after the burst
const EXILE_TICK_INTERVAL_SECONDS = 2;

// The Exile's four-piece bonus, its energy and its seconds in the set table's order: a burst its wearer uses regenerates
// That energy for every other member of the deployed team on each tick of a field with no edge, for those seconds. The
// Energy is flat, as Energy Recharge does not raise it, and a burst while the field still ticks, its wearer's or another
// Wearer's, starts no second one, as gcsim (MIT) exile.go rejects it
export const createExileSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const energy = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { body: { position }, kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.BurstUsed ||
        event.characterId !== combatant.characterId ||
        kitEffectState.effects.some((effect) => effect.kind === "field" && effect.id === EXILE_FIELD_ID)
      )
        return;
      addKitEffect(kitEffectState, {
        centre: { x: position.x, z: position.z },
        characterId: combatant.characterId,
        id: EXILE_FIELD_ID,
        kind: "field",
        nextTickSeconds: EXILE_TICK_INTERVAL_SECONDS,
        onTick: ({ characterIdCombatantMap, party }) => {
          for (const characterId of getDeployedCharacterIds(party)) {
            const member = characterIdCombatantMap.get(characterId);
            if (member && characterId !== combatant.characterId) gainPartyMemberEnergy(party, member, energy);
          }
        },
        radius: UNBOUNDED_FIELD_RADIUS,
        secondsRemaining: seconds + SUMMON_LINGER_SECONDS,
        tickIndex: 0,
        tickIntervalSeconds: EXILE_TICK_INTERVAL_SECONDS,
      });
    },
  };
};
