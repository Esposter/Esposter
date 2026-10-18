import type { KitField } from "#src/models/kit/KitField";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getStellarConductElementalDmgBonus } from "#src/services/combat/damage/getStellarConductElementalDmgBonus";
import {
  POLESTAR_BUFF_SOURCE,
  POLESTAR_FIELD_TICK_SECONDS,
  RADIANCE_STELLAR_CONDUCT_STATUS_ID,
} from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { shredPolestarEnemies } from "#src/services/kit/shredPolestarEnemies";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The Starlight Prism's hooks on its field, each closing over the count of its own field. A Cryo or Electro applied to
// An enemy inside the field is a recorded hit. Each tick of the field's schedule, which counts whether or not the body
// Stands inside it, the count becomes the one the buff reads and starts again, and while the body stands inside, its
// Cryo and its Electro DMG Bonus carry that buff for a tick's seconds, as gcsim's think interval does, and every
// Deployed member is in Radiance: Stellar-Conduct for as long, carrying that count, which a direct Stellar-Conduct hit
// Reads its coefficient by, as gcsim tags each character with it (pkg/reactable/stellarconduct_gadget.go:161). The
// Step also shreds the Physical RES
export const createPolestarFieldHooks = (): Pick<KitField, "onEvent" | "onStep" | "onTick"> => {
  let recordedHits = 0;
  let buffedHits = 0;
  // The tick the count last reset at, read off the field's own tick index so the reset follows its schedule
  let thinkTickIndex = 0;
  return {
    onEvent: (event, field) => {
      if (
        event.kind === KitEventKind.ElementApplied &&
        (event.element === Element.Cryo || event.element === Element.Electro) &&
        checkIsInKitField(field, event.enemy.position)
      )
        recordedHits++;
    },
    onStep: (context, field) => {
      if (field.tickIndex !== thinkTickIndex) {
        thinkTickIndex = field.tickIndex;
        buffedHits = recordedHits;
        recordedHits = 0;
      }
      shredPolestarEnemies(context, field);
      if (!checkIsInKitField(field, context.body.position)) return;
      for (const characterId of getDeployedCharacterIds(context.party))
        addKitStatus(context.kitEffectState, characterId, {
          id: RADIANCE_STELLAR_CONDUCT_STATUS_ID,
          secondsRemaining: POLESTAR_FIELD_TICK_SECONDS,
          stacks: buffedHits,
        });
      const amount = getStellarConductElementalDmgBonus(buffedHits);
      for (const attribute of [Attribute.CryoDamageBonus, Attribute.ElectroDamageBonus])
        buffKitMember(context.kitEffectState, context.activeCombatant.characterId, {
          amount,
          attribute,
          secondsRemaining: POLESTAR_FIELD_TICK_SECONDS,
          source: POLESTAR_BUFF_SOURCE,
        });
    },
    onTick: () => undefined,
  };
};
