import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { HAUNTED_NIGHT_STATUS_ID, NIGHTINGALE_SONG_STATUS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { consumeKitNightingaleStacks } from "#src/services/kit/effects/consumeKitNightingaleStacks";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { setKitNightingaleCount } from "#src/services/kit/effects/setKitNightingaleCount";
import { startKitHauntedNight } from "#src/services/kit/effects/startKitHauntedNight";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { takeOne } from "@esposter/shared";

export const ILLUGA_CHARACTER_ID = 10_000_127;
// The status Torchforger's Covenant gives each other member, whose Moonsign and CRIT Lightkeeper's Oath reads by its id
export const LIGHTKEEPERS_OATH_STATUS_ID = "lightkeepers-oath";

// Shadowless Reflection, as the wiki's talent text gives it: the burst gains Haunted Night's Oriole-Song effect for 20
// Seconds, and while it is active Illuga gains 21 stacks of Nightingale's Song
const HAUNTED_NIGHT_SECONDS = 20;
const NIGHTINGALE_SONG_STACKS = 21;
// The stacks one Geo hit a nearby active party member lands on an enemy spends
const NIGHTINGALE_SONG_STACKS_PER_HIT = 1;
// Torchforger's Covenant, the ascension 1 passive: after his skill or burst, each other party member gains Lightkeeper's
// Oath for 20 seconds, which gives its Geo hits 5% CRIT Rate and 10% CRIT DMG, and under Ascendant Gleam, 50 Elemental
// Mastery
const TORCHFORGER_ASCENSION = 1;
const LIGHTKEEPERS_OATH_SECONDS = 20;
const LIGHTKEEPERS_OATH_CRIT_RATE = 0.05;
const LIGHTKEEPERS_OATH_CRIT_DAMAGE = 0.1;
const LIGHTKEEPERS_OATH_ELEMENTAL_MASTERY = 50;
// Constellation 6, Nightmare Orioles, enhances Lightkeeper's Oath to 10% CRIT Rate, 30% CRIT DMG and 80 Elemental Mastery
const CONSTELLATION_6 = 6;
const NIGHTMARE_ORIOLES_CRIT_RATE = 0.1;
const NIGHTMARE_ORIOLES_CRIT_DAMAGE = 0.3;
const NIGHTMARE_ORIOLES_ELEMENTAL_MASTERY = 80;
// Constellation 4, Solarhunting Wolf: while Haunted Night's Oriole-Song is active, nearby active party members gain 200 DEF
const CONSTELLATION_4 = 4;
const SOLARHUNTING_WOLF_DEFENSE = 200;
// Constellation 2, Elk With Fanged Antlers: for every 7 stacks of Nightingale's Song consumed, Aedon summons one Geo hit of
// 400% of Elemental Mastery and 200% of DEF on one nearby opponent, as Elemental Burst DMG
const CONSTELLATION_2 = 2;
const AEDON_NIGHTINGALE_SONG_STACKS = 7;
const AEDON_ELEMENTAL_MASTERY_SHARE = 4;
const AEDON_DEFENSE_SHARE = 2;
// The stacks counted toward Aedon's next hit, which Haunted Night holds as its count does
const AEDON_STACKS_STATUS_ID = "illuga-aedon-stacks";
const SOLARHUNTING_WOLF_SOURCE = "illuga-solarhunting-wolf";
const LIGHTKEEPERS_OATH_MOONSIGN_SOURCE = "illuga-lightkeepers-oath-moonsign";

// The Aedon hit Constellation 2 summons, priced from Illuga's Elemental Mastery and DEF. Its area is the burst's first hit's,
// And its hitmark and poise are taken as none, since the talent's text gives no area or hitmark of its own
const createAedonHit = (combatant: Combatant): KitHit => ({
  additiveBaseDamageBonus: (striker) =>
    elementalMasteryMultiplier(striker, AEDON_ELEMENTAL_MASTERY_SHARE) +
    striker.attributes.defense * AEDON_DEFENSE_SHARE,
  element: Element.Geo,
  hitArea: takeOne(combatant.kit.elementalBurst.hits).hitArea,
  hitmarkSeconds: 0,
  poiseDamage: 0,
  talentMultiplier: 0,
  targetIndex: 0,
});

// Gives each other deployed member Lightkeeper's Oath as Illuga's skill or burst starts, from ascension 1 on
const giveLightkeepersOath = ({ activeCombatant, kitEffectState, party }: KitContext): void => {
  if (activeCombatant.ascension < TORCHFORGER_ASCENSION) return;
  for (const characterId of getDeployedCharacterIds(party))
    if (characterId !== activeCombatant.characterId)
      addKitStatus(kitEffectState, characterId, {
        id: LIGHTKEEPERS_OATH_STATUS_ID,
        secondsRemaining: LIGHTKEEPERS_OATH_SECONDS,
      });
};

// Illuga's behaviour: Shadowless Reflection lights the lamp and starts Haunted Night's Oriole-Song. Each Geo hit a nearby
// Active party member lands on an enemy spends a stack of Nightingale's Song, Illuga's own hits aside, and adds the Geo DMG
// Bonus its stack gives, 33.6% of Illuga's Elemental Mastery, read from the burst's proud group. Her strikes, charged
// Attack, plunges, skill and burst's hits are her record's alone, and her frames and areas are provisional, read from
// Borrowed donors' gcsim hitmarks and areas.
// Torchforger's Covenant gives each other member Lightkeeper's Oath after her skill or burst, and Constellation 6
// Enhances that Oath. Constellation 2 summons Aedon's hit for every 7 stacks consumed, and Constellation 4 gives the active
// Party member 200 DEF while Haunted Night holds. Nearby and active are read as the deployed team and the member on the field.
// Not built: the stacks from Geo Constructs; the Lunar-Crystallize enhancement Constellation 1 needs, which the kit does not
// Read; Vigilant Sentinel, the passive that restores 12 Elemental Energy after a Geo-related Reaction on the field
export const createIllugaKitBehaviour = ({ readParameter }: KitRecordReader): KitBehaviour => {
  const nightingaleSongGeoDamageBonus = readParameter("nightingaleSongGeoDamageBonus");
  return {
    burst: {
      onStart: (context) => {
        startKitHauntedNight(context.kitEffectState, context.activeCombatant.characterId, {
          secondsRemaining: HAUNTED_NIGHT_SECONDS,
          stacks: NIGHTINGALE_SONG_STACKS,
        });
        giveLightkeepersOath(context);
      },
    },
    getPartyStrikeBonus: (combatant, { combatant: striker, hit }, _enemy, party, effects) => {
      if (hit.element !== Element.Geo) return {};
      const isOathed = findKitStatus(effects, striker.characterId, LIGHTKEEPERS_OATH_STATUS_ID) !== undefined;
      const isNightingaleBonused =
        striker.characterId !== combatant.characterId &&
        striker.characterId === getActiveCharacterId(party) &&
        findKitStatus(effects, combatant.characterId, HAUNTED_NIGHT_STATUS_ID) !== undefined &&
        countKitResource(effects, combatant.characterId, NIGHTINGALE_SONG_STATUS_ID) >= NIGHTINGALE_SONG_STACKS_PER_HIT;
      const isNightmareOrioles = combatant.constellationCount >= CONSTELLATION_6;
      return {
        ...(isOathed && {
          criticalDamageBonus: isNightmareOrioles ? NIGHTMARE_ORIOLES_CRIT_DAMAGE : LIGHTKEEPERS_OATH_CRIT_DAMAGE,
          criticalRateBonus: isNightmareOrioles ? NIGHTMARE_ORIOLES_CRIT_RATE : LIGHTKEEPERS_OATH_CRIT_RATE,
        }),
        ...(isNightingaleBonused && {
          additiveBaseDamageBonus:
            elementalMasteryMultiplier(combatant, nightingaleSongGeoDamageBonus) * NIGHTINGALE_SONG_STACKS_PER_HIT,
        }),
      };
    },
    onKitEvent: (event, context, combatant) => {
      const { activeCombatant, kitEffectState } = context;
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.element !== Element.Geo ||
        event.striker.characterId === combatant.characterId ||
        event.striker.characterId !== activeCombatant.characterId
      )
        return;
      const consumed = consumeKitNightingaleStacks(
        kitEffectState,
        combatant.characterId,
        NIGHTINGALE_SONG_STACKS_PER_HIT,
      );
      if (consumed === 0 || combatant.constellationCount < CONSTELLATION_2) return;
      const total = countKitResource(kitEffectState.effects, combatant.characterId, AEDON_STACKS_STATUS_ID) + consumed;
      if (findKitStatus(kitEffectState.effects, combatant.characterId, HAUNTED_NIGHT_STATUS_ID))
        setKitNightingaleCount(
          kitEffectState,
          combatant.characterId,
          AEDON_STACKS_STATUS_ID,
          total % AEDON_NIGHTINGALE_SONG_STACKS,
        );
      else
        removeKitEffects(
          kitEffectState,
          (effect) =>
            effect.kind === "status" &&
            effect.characterId === combatant.characterId &&
            effect.id === AEDON_STACKS_STATUS_ID,
        );
      const summons = Math.floor(total / AEDON_NIGHTINGALE_SONG_STACKS);
      // Aedon's hit is considered Elemental Burst DMG by the talent's text, as gcsim has no folder for Illuga
      for (let summon = 0; summon < summons; summon++)
        castKitSummon(kitEffectState, context.body, combatant, [createAedonHit(combatant)], {
          attackTag: AttackTag.ElementalBurst,
        });
    },
    onStep: (context, combatant) => {
      const { activeCombatant, characterIdCombatantMap, kitEffectState, party } = context;
      const hauntedNight = findKitStatus(kitEffectState.effects, combatant.characterId, HAUNTED_NIGHT_STATUS_ID);
      if (hauntedNight && combatant.constellationCount >= CONSTELLATION_4)
        buffKitMember(kitEffectState, activeCombatant.characterId, {
          amount: SOLARHUNTING_WOLF_DEFENSE,
          attribute: Attribute.Defense,
          isEndedOnSwap: true,
          secondsRemaining: hauntedNight.secondsRemaining,
          source: SOLARHUNTING_WOLF_SOURCE,
        });
      if (getMoonsignLevel(characterIdCombatantMap, party) !== MoonsignLevel.AscendantGleam) return;
      const elementalMastery =
        combatant.constellationCount >= CONSTELLATION_6
          ? NIGHTMARE_ORIOLES_ELEMENTAL_MASTERY
          : LIGHTKEEPERS_OATH_ELEMENTAL_MASTERY;
      for (const characterId of getDeployedCharacterIds(party)) {
        const oath = findKitStatus(kitEffectState.effects, characterId, LIGHTKEEPERS_OATH_STATUS_ID);
        if (oath)
          buffKitMember(kitEffectState, characterId, {
            amount: elementalMastery,
            attribute: Attribute.ElementalMastery,
            secondsRemaining: oath.secondsRemaining,
            source: LIGHTKEEPERS_OATH_MOONSIGN_SOURCE,
          });
      }
    },
    skill: { onStart: giveLightkeepersOath },
    skillHolds: [{ onStart: giveLightkeepersOath }],
  };
};
