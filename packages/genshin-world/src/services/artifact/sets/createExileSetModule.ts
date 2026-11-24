import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const EXILE_FIELD_ID = "exile";
// Measured: the wiki's The Exile, its energy every 2 seconds, the first tick 2 seconds after the burst
const EXILE_TICK_INTERVAL_SECONDS = 2;

// The Exile's four-piece bonus, its energy and its seconds in the set table's order.
// A burst its wearer uses regenerates that energy for every other deployed member on each tick of an edgeless field.
// The field runs for the bonus's seconds.
// The energy is flat, as Energy Recharge does not raise it.
// A burst while the field still ticks, its wearer's or another wearer's, starts no second one.
// This follows gcsim (MIT) exile.go, which rejects it.
export const createExileSetModule = ({ params }: ArtifactSetBonus): PassiveModule => {
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
