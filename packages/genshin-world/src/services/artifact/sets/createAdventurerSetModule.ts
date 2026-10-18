import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { takeOne } from "@esposter/shared";

const ADVENTURER_FIELD_ID = "adventurer";

// Adventurer's four-piece bonus, its seconds, its tick interval and the share of its wearer's Max HP each tick
// Restores, in the set table's order. A chest opened in the world restores that share to its wearer on each tick of a
// Field with no edge, for those seconds, raised by the Healing Bonuses as every heal is. Only a wearer's kit carries
// This module, so an opened chest restores no other member. A chest opened while the restoration runs restarts it, so two
// Chests never restore at once
export const createAdventurerSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const seconds = takeOne(params, 0);
  const tickIntervalSeconds = takeOne(params, 1);
  const healedHealthShare = takeOne(params, 2);
  return {
    onKitEvent: (event, { body: { position }, kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ChestOpened) return;
      kitEffectState.effects = kitEffectState.effects.filter(
        (effect) =>
          !(
            effect.kind === "field" &&
            effect.id === ADVENTURER_FIELD_ID &&
            effect.characterId === combatant.characterId
          ),
      );
      addKitEffect(kitEffectState, {
        centre: { x: position.x, z: position.z },
        characterId: combatant.characterId,
        id: ADVENTURER_FIELD_ID,
        kind: "field",
        nextTickSeconds: tickIntervalSeconds,
        onTick: (context) =>
          changeKitMemberHealth(
            context,
            combatant,
            combatant.characterId,
            healedHealthShare * combatant.attributes.maxHealth,
          ),
        radius: UNBOUNDED_FIELD_RADIUS,
        secondsRemaining: seconds,
        tickIndex: 0,
        tickIntervalSeconds,
      });
    },
  };
};
