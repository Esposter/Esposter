import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// The coil stacks a Chillwater Bomblet adds, and the stacks at which Rushing Ice takes them and infuses Aloy's attacks.
// Provisional: gcsim gives the coils no end while Aloy is on the field, so they are a resource Rushing Ice spends
const COIL_RUSHING_ICE_STACKS = 4;
const COIL_RESOURCE_ID = "aloy-coil";
const RUSHING_ICE_STATUS_ID = "aloy-rushing-ice";
// Measured: gcsim v2.47.2 (MIT) aloy/asc.go, Ascension 1: while Rushing Ice holds, Aloy's ATK rises by 16% and each nearby
// Party member's by 8%, for its seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/aloy/asc.go
const ASCENSION_1 = 1;
const ASCENSION_1_ATTACK_SHARE = 0.08;
const ASCENSION_1_SELF_ATTACK_SHARE = 0.08;
const ASCENSION_1_SOURCE = "aloy-ascension-1";
const ASCENSION_1_SELF_SOURCE = "aloy-ascension-1-self";
// Measured: gcsim v2.47.2 (MIT) aloy/asc.go, Ascension 4: while Rushing Ice holds, Aloy's Cryo DMG Bonus rises by 3.5% each
// Second, up to 35% at the tenth, as gcsim's stacks do
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/aloy/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_CRYO_SHARE_PER_STACK = 0.035;
const ASCENSION_4_MAX_STACKS = 10;
const ASCENSION_4_SOURCE = "aloy-ascension-4";

export const ALOY_CHARACTER_ID = 10_000_062;

// Aloy's Cryo DMG Bonus at a count of Ascension 4 stacks, as one buff restarted with each stack, so it ends with Rushing Ice
const addCryoStacks = (
  kitEffectState: KitEffectState,
  characterId: number,
  stacks: number,
  secondsRemaining: number,
): void =>
  buffKitMember(kitEffectState, characterId, {
    amount: Math.min(stacks, ASCENSION_4_MAX_STACKS) * ASCENSION_4_CRYO_SHARE_PER_STACK,
    attribute: Attribute.CryoDamageBonus,
    secondsRemaining,
    source: ASCENSION_4_SOURCE,
  });

// Aloy's behaviour: each of Freeze Bomb's two Chillwater Bomblets adds a coil stack as it strikes, and four coil stacks
// Give Cryo infusion for the table's seconds of Rushing Ice. From Ascension 1, Rushing Ice raises the ATK of the deployed
// Team, and Aloy's own by 8% more, and from Ascension 4 it raises her Cryo DMG Bonus a step each second. Her Coil and Rushing
// Ice normal attack bonuses are not built, as no kit step reads a normal attack's DMG bonus from the team's effects. Her
// Constellations are not built, as the game cannot activate them
export const createAloyKitBehaviour = ({ readSeconds }: KitRecordReader): KitBehaviour => {
  const rushingIceSeconds = readSeconds("rushingIceDuration");
  // Each Chillwater Bomblet that lands counts a coil stack, and the fourth gives Rushing Ice, which holds off any more coils
  // Until it ends. Provisional: gcsim counts a bomblet once for all the enemies it strikes, where this counts each one
  const addCoilStack = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, RUSHING_ICE_STATUS_ID)) return;
    if (
      gainKitResource(kitEffectState, combatant.characterId, COIL_RESOURCE_ID, 1, COIL_RUSHING_ICE_STACKS) <
      COIL_RUSHING_ICE_STACKS
    )
      return;
    spendKitResource(kitEffectState, combatant.characterId, COIL_RESOURCE_ID);
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      element: Element.Cryo,
      kind: "infusion",
      secondsRemaining: rushingIceSeconds,
    });
    addKitStatus(kitEffectState, combatant.characterId, {
      id: RUSHING_ICE_STATUS_ID,
      secondsRemaining: rushingIceSeconds,
    });
    if (combatant.ascension >= ASCENSION_1) {
      buffKitTeam(kitEffectState, party, {
        amount: ASCENSION_1_ATTACK_SHARE,
        attribute: Attribute.AttackPercent,
        secondsRemaining: rushingIceSeconds,
        source: ASCENSION_1_SOURCE,
      });
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: ASCENSION_1_SELF_ATTACK_SHARE,
        attribute: Attribute.AttackPercent,
        secondsRemaining: rushingIceSeconds,
        source: ASCENSION_1_SELF_SOURCE,
      });
    }
    if (combatant.ascension < ASCENSION_4) return;
    addCryoStacks(kitEffectState, combatant.characterId, 1, rushingIceSeconds);
    // Each second adds a stack, the buff restarting with it to end with Rushing Ice
    for (let second = 1; second < ASCENSION_4_MAX_STACKS; second++)
      scheduleKitTask(kitEffectState, combatant.characterId, second, ({ kitEffectState: tickKitEffectState }) =>
        addCryoStacks(tickKitEffectState, combatant.characterId, second + 1, rushingIceSeconds - second),
      );
  };
  // Freeze Bomb's own hit, then its two Chillwater Bomblets
  return { skill: { hits: [{}, { onStrike: addCoilStack }, { onStrike: addCoilStack }] } };
};
