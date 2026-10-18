import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The Autumn Whirlwind's absorb check takes the first aura of Pyro, Hydro, Electro or Cryo an enemy within its reach
// Carries, and each tick after it lands its elemental tick in that element just ahead of its Anemo tick, as gcsim v2.47.2
// (MIT) kazuha/burst.go gives it. The check's field lives a tenth of a second past its last check, so the step that runs
// It still has it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kazuha/burst.go
const ABSORB_FIELD_LINGER_SECONDS = 0.1;

// Measured: gcsim (MIT) kazuha/cons.go, Chihayaburu's and Kazuha Slash's cooldowns each drop by a tenth from Constellation 1,
// Which the table's 360 and 540 frames become 324 and 486 with
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kazuha/cons.go
const PRESS_AND_HOLD_CONSTELLATION = 1;
const COOLDOWN_CONSTELLATION_MULTIPLIER = 0.9;
// Measured: gcsim (MIT) kazuha/cons.go, from Constellation 6 each Chihayaburu or Kazuha Slash gives Kazuha an Anemo infusion for
// 5 seconds, which infuses his normal, charged and plunging attacks
const INFUSION_CONSTELLATION = 6;
const INFUSION_SECONDS = 5;
// Poetics of Fuubutsu, Kazuha's Ascension 4 passive as its text gives it: a Swirl he triggers gives each party member an
// Elemental DMG Bonus to the absorbed element of 0.04% for every point of his Elemental Mastery, for 8 seconds
const ASCENSION_4 = 4;
const POETICS_ELEMENTAL_DAMAGE_BONUS_SHARE = 0.0004;
const POETICS_SECONDS = 8;
const POETICS_SOURCE = "kazuha-poetics-of-fuubutsu";
// Kazuha's Anemo infusion from Constellation 6 lasts for the seconds after each press, hold or slash that gives it
const addInfusion = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  if (combatant.constellationCount < INFUSION_CONSTELLATION) return;
  addKitEffect(kitEffectState, {
    characterId: combatant.characterId,
    element: Element.Anemo,
    kind: "infusion",
    secondsRemaining: INFUSION_SECONDS,
  });
};

export const KAZUHA_CHARACTER_ID = 10_000_047;

// Kazuha's behaviour: Chihayaburu's press and hold and Kazuha Slash each give him Constellation 6's infusion, and Kazuha
// Slash casts its Autumn Whirlwind with its absorb check. Constellation 1 shortens his skill cooldowns. Poetics of
// Fuubutsu is built from Ascension 4. The absorption of the Chihayaburu from Ascension 1 and Constellation 2's field are not
export const createKazuhaKitBehaviour = ({
  readArea,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const tickHits = readHits("autumnWhirlwindTicks");
  const elementalTickMultiplier = readParameter("autumnWhirlwindAbsorptionMultiplier");
  const absorbCheckArea = readArea("absorbCheck");
  const absorbCheckFirstSeconds = readSeconds("absorbCheckFirst");
  const absorbCheckIntervalSeconds = readSeconds("absorbCheckInterval");
  const absorbCheckLastSeconds = readSeconds("absorbCheckLast");
  return {
    // The slash strikes where Kazuha stands, and its Autumn Whirlwind is a summon cast at his body that ticks from
    // There. Its absorb check is a field set beside it, which takes an element only once and then lands that element's
    // Tick ahead of each tick still to come
    burst: {
      onStart: (context) => {
        addInfusion(context);
        const { activeCombatant: combatant, body, kitEffectState } = context;
        const whirlwind = castKitSummon(kitEffectState, body, combatant, tickHits);
        let isAbsorbed = false;
        castKitField(kitEffectState, combatant.characterId, whirlwind.body.position, {
          nextTickSeconds: absorbCheckFirstSeconds,
          onTick: ({ enemyMap }) => {
            if (isAbsorbed) return;
            const element = findAbsorbedElement(
              [...enemyMap.values()].filter((enemy) => checkIsInAttackArea(absorbCheckArea, whirlwind.body, enemy)),
            );
            if (element === undefined) return;
            isAbsorbed = true;
            whirlwind.hits = whirlwind.hits.flatMap((hit) =>
              hit.hitmarkSeconds > whirlwind.elapsedSeconds
                ? [{ ...hit, element, talentMultiplier: elementalTickMultiplier }, hit]
                : [hit],
            );
          },
          secondsRemaining: absorbCheckLastSeconds + ABSORB_FIELD_LINGER_SECONDS,
          tickIntervalSeconds: absorbCheckIntervalSeconds,
        });
      },
    },
    getSkillCooldownMultiplier: ({ activeCombatant: combatant }) =>
      combatant.constellationCount >= PRESS_AND_HOLD_CONSTELLATION ? COOLDOWN_CONSTELLATION_MULTIPLIER : 1,
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        combatant.ascension < ASCENSION_4 ||
        event.striker.characterId !== combatant.characterId
      )
        return;
      for (const { element, reactionType } of event.reactions) {
        if (reactionType !== ReactionType.Swirl || element === undefined) continue;
        for (const characterId of getDeployedCharacterIds(party))
          buffKitMember(kitEffectState, characterId, {
            amount:
              POETICS_ELEMENTAL_DAMAGE_BONUS_SHARE * combatant.attributes.attributeTotalMap[Attribute.ElementalMastery],
            attribute: ElementDamageBonusAttributeMap[element],
            secondsRemaining: POETICS_SECONDS,
            source: POETICS_SOURCE,
          });
      }
    },
    skill: { onStart: addInfusion },
    skillHolds: [{ onStart: addInfusion }],
  };
};
