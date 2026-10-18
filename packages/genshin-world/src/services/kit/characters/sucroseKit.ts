import type { Element } from "#src/models/Element";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Measured: gcsim v2.47.2 (MIT) sucrose/burst.go, Forbidden Creation's field five metres ahead of the body and its absorb
// Check four metres ahead, the absorbing enemy's aura taken from the first aura of Pyro, Hydro, Electro or Cryo an enemy
// Within its reach carries
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/burst.go
const BURST_OFFSET_METRES = 5;
const ABSORB_CHECK_OFFSET_METRES = 4;
// The field lives a tenth of a second past its last tick, so the step that runs it still has it
const FIELD_LINGER_SECONDS = 0.1;

// Sucrose's passives and constellations, as gcsim v2.47.2 (MIT) gives them. A1 raises the Elemental Mastery of the members
// Of the swirled element by 50 for 8 seconds on a Swirl she triggers, and A4 gives the rest of the team 20% of her
// Elemental Mastery for 8 seconds on each skill and burst hit. Constellation 2 lengthens the burst by 2 seconds, and
// Constellation 6 gives the team 20% DMG Bonus of the absorbed element for 10 seconds when the field absorbs one
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sucrose/asc.go
const SWIRL_ASCENSION = 1;
const SWIRL_ELEMENTAL_MASTERY_BONUS = 50;
const SWIRL_SECONDS = 8;
const SWIRL_SOURCE = "sucrose-swirl";
const SKILL_BURST_ASCENSION = 4;
const SKILL_BURST_ELEMENTAL_MASTERY_SHARE = 0.2;
const SKILL_BURST_SECONDS = 8;
const SKILL_BURST_SOURCE = "sucrose-skill-burst";
const FORBIDDEN_CREATION_CONSTELLATION = 2;
const FORBIDDEN_CREATION_EXTRA_SECONDS = 2;
const ABSORBED_ELEMENT_CONSTELLATION = 6;
const ABSORBED_ELEMENT_DAMAGE_BONUS = 0.2;
const ABSORBED_ELEMENT_SECONDS = 10;
const ABSORBED_ELEMENT_SOURCE = "sucrose-absorbed-element";

export const SUCROSE_CHARACTER_ID = 10_000_043;

const CONSTELLATION_1 = 1;

// Sucrose's behaviour: Forbidden Creation-Isomer 75 / Type II sets its field ahead of her, whose Anemo tick lands from a
// Summon while it lasts, and whose absorb check takes the first aura an enemy within its reach carries, the absorbed
// Element's hit then landing on every tick. Her passives and Constellations 1, 2 and 6 are built. The skill's pull is not,
// As no enemy moves on a kit's terms, and Constellation 4 is not, as the kit has no cooldown to shorten. Her Hexerei team
// Bonus is not built, as the party does not count the Hexerei it needs
// Constellation 4 needs the Astable cooldown to shorten on every seventh attack, which the kit does not track
export const createSucroseKitBehaviour = ({
  kit,
  readArea,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const [skillHit] = kit.elementalSkill.hits;
  const burstTickHit = readHit("burstTick");
  const absorbedHitMultiplier = readParameter("forbiddenCreationAbsorbedMultiplier");
  const forbiddenCreationSeconds = readParameter("forbiddenCreationSeconds");
  const burstFirstTickSeconds = readSeconds("burstFirstTick");
  const burstTickIntervalSeconds = readSeconds("burstTickInterval");
  // The field's last tick falls a few frames past its seconds
  const burstLastTickMarginSeconds = readSeconds("burstLastTickMargin");
  const absorbCheckArea = readArea("absorbCheck");
  const absorbCheckFirstSeconds = readSeconds("absorbCheckFirst");
  const absorbCheckIntervalSeconds = readSeconds("absorbCheckInterval");
  return {
    // The burst's two fields are set as it is cast: the Anemo tick's, and the absorb check's, which lands the absorbed
    // Element's hit on every tick once an enemy's aura is taken, and which takes one only once
    // Clustered Vacuum Field, from Constellation 1, gives Astable Anemohypostasis Creation one more charge
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const centreBody = createAheadBody(body, BURST_OFFSET_METRES);
        const absorbBody = createAheadBody(body, ABSORB_CHECK_OFFSET_METRES);
        const isConstellation2 = combatant.constellationCount >= FORBIDDEN_CREATION_CONSTELLATION;
        const durationSeconds = forbiddenCreationSeconds + (isConstellation2 ? FORBIDDEN_CREATION_EXTRA_SECONDS : 0);
        const secondsRemaining = durationSeconds + burstLastTickMarginSeconds + FIELD_LINGER_SECONDS;
        let absorbedElement: Element | undefined;
        const centre = { x: centreBody.position.x, z: centreBody.position.z };
        castKitField(kitEffectState, combatant.characterId, centre, {
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ kitEffectState: tickState }) => {
            castKitSummon(tickState, centreBody, combatant, [burstTickHit]);
            if (absorbedElement !== undefined)
              castKitSummon(tickState, centreBody, combatant, [
                { ...burstTickHit, element: absorbedElement, talentMultiplier: absorbedHitMultiplier },
              ]);
          },
          secondsRemaining,
          tickIntervalSeconds: burstTickIntervalSeconds,
        });
        castKitField(kitEffectState, combatant.characterId, centre, {
          nextTickSeconds: absorbCheckFirstSeconds,
          onTick: ({ enemyMap, kitEffectState: tickState, party }) => {
            if (absorbedElement !== undefined) return;
            absorbedElement = findAbsorbedElement(
              [...enemyMap.values()].filter((enemy) => checkIsInAttackArea(absorbCheckArea, absorbBody, enemy)),
            );
            if (absorbedElement === undefined || combatant.constellationCount < ABSORBED_ELEMENT_CONSTELLATION) return;
            buffKitTeam(tickState, party, {
              amount: ABSORBED_ELEMENT_DAMAGE_BONUS,
              attribute: ElementDamageBonusAttributeMap[absorbedElement],
              secondsRemaining: ABSORBED_ELEMENT_SECONDS,
              source: ABSORBED_ELEMENT_SOURCE,
            });
          },
          secondsRemaining,
          tickIntervalSeconds: absorbCheckIntervalSeconds,
        });
      },
    },
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      const members = getDeployedCharacterIds(party);
      if (event.kind === KitEventKind.ReactionTriggered) {
        if (combatant.ascension < SWIRL_ASCENSION || event.striker.characterId !== combatant.characterId) return;
        for (const reaction of event.reactions) {
          if (reaction.reactionType !== ReactionType.Swirl || reaction.element === undefined) continue;
          for (const characterId of members)
            if (characterIdCombatantMap.get(characterId)?.element === reaction.element)
              buffKitMember(kitEffectState, characterId, {
                amount: SWIRL_ELEMENTAL_MASTERY_BONUS,
                attribute: Attribute.ElementalMastery,
                secondsRemaining: SWIRL_SECONDS,
                source: SWIRL_SOURCE,
              });
        }
      } else if (event.kind === KitEventKind.DamageTaken) {
        if (
          combatant.ascension < SKILL_BURST_ASCENSION ||
          event.striker.characterId !== combatant.characterId ||
          (event.hit !== skillHit && event.hit !== burstTickHit)
        )
          return;
        const amount =
          SKILL_BURST_ELEMENTAL_MASTERY_SHARE * event.striker.attributes.attributeTotalMap[Attribute.ElementalMastery];
        for (const characterId of members)
          if (characterId !== combatant.characterId)
            buffKitMember(kitEffectState, characterId, {
              amount,
              attribute: Attribute.ElementalMastery,
              secondsRemaining: SKILL_BURST_SECONDS,
              source: SKILL_BURST_SOURCE,
            });
      }
    },
  };
};
