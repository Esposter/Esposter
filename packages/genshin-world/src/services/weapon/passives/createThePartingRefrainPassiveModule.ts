import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { takeOne } from "@esposter/shared";

const FAREWELL_SONG_SOURCE = "farewellSong";
const SIGIL_COOLDOWN_ID = "sigilOfRemembranceCooldown";
const SIGIL_ID = "sigilOfRemembrance";
const SIGIL_LOCKOUT_ID = "farewellSongLockout";
const SIGIL_MAXIMUM = 4;

// The Parting Refrain at its rank: the wielder's Elemental Mastery rises by the rank's amount. Each Elemental Skill or Elemental
// Burst hit it deals gains a Sigil of Remembrance, once every cooldown, whether or not it is on the field. At four Sigils they are
// Consumed and the deployed team gains Farewell Song for the rank's seconds, with the second Elemental Mastery and the second ATK
// Share, and no Sigil is gained for the rank's lockout seconds after it
export const createThePartingRefrainPassiveModule = (params: number[]): WeaponPassiveModule => {
  const elementalMastery = takeOne(params, 0);
  const sigilCooldownSeconds = takeOne(params, 1);
  const farewellSeconds = takeOne(params, 2);
  const farewellElementalMastery = takeOne(params, 3);
  const farewellAttackPercent = takeOne(params, 4);
  const lockoutSeconds = takeOne(params, 5);
  return {
    getPassiveBonuses: () => [{ amount: elementalMastery, attribute: Attribute.ElementalMastery }],
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        (event.attackTag !== AttackTag.ElementalSkill && event.attackTag !== AttackTag.ElementalBurst)
      )
        return;
      const { characterId } = combatant;
      const { effects } = kitEffectState;
      if (
        checkIsKitStatusActive(effects, characterId, SIGIL_LOCKOUT_ID) ||
        checkIsKitStatusActive(effects, characterId, SIGIL_COOLDOWN_ID)
      )
        return;
      addKitStatus(kitEffectState, characterId, { id: SIGIL_COOLDOWN_ID, secondsRemaining: sigilCooldownSeconds });
      addKitHold(kitEffectState, characterId, {
        id: SIGIL_ID,
        maximum: SIGIL_MAXIMUM,
        seconds: Number.POSITIVE_INFINITY,
      });
      if (countKitHolds(kitEffectState.effects, characterId, SIGIL_ID) < SIGIL_MAXIMUM) return;
      releaseKitHolds(kitEffectState, characterId, SIGIL_ID);
      addKitStatus(kitEffectState, characterId, { id: SIGIL_LOCKOUT_ID, secondsRemaining: lockoutSeconds });
      buffKitTeam(kitEffectState, party, {
        amount: farewellElementalMastery,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: farewellSeconds,
        source: FAREWELL_SONG_SOURCE,
      });
      buffKitTeam(kitEffectState, party, {
        amount: farewellAttackPercent,
        attribute: Attribute.AttackPercent,
        secondsRemaining: farewellSeconds,
        source: FAREWELL_SONG_SOURCE,
      });
    },
  };
};
