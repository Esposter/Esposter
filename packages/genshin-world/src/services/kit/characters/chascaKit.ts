import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

export const CHASCA_CHARACTER_ID = 10_000_104;

// Her blessing starts with 80 points, which drain eight a second, 0.8 each six frames, and a sprint in it drains 13.3
// More, as gcsim (MIT) chasca/skill.go enterNightsoul and reduceNightsoulPoints and chasca/dash.go do
const NIGHTSOUL_POINTS = 80;
const NIGHTSOUL_DRAIN_PER_SECOND = 8;
const NIGHTSOUL_SPRINT_DRAIN = 13.3;

// The elements a Radiant shell takes from the team, as gcsim's Pyro, Hydro, Electro and Cryo bullet types do
const RADIANT_ELEMENTS = new Set<Element>([Element.Pyro, Element.Hydro, Element.Electro, Element.Cryo]);

// The elements of the team's Radiant shells in order: each Pyro, Hydro, Electro or Cryo member's element once, the list
// Twice over, as galesplitting's bullets are the team's types twice (burst.go:70-71). gcsim shuffles the bullets at random,
// Which the kit does not, so the shells take them in the order the team is deployed in
const readRadiantElements = ({ characterIdCombatantMap, party }: KitContext): Element[] => {
  const elements = getDeployedCharacterIds(party).flatMap((characterId) => {
    const element = characterIdCombatantMap.get(characterId)?.element;
    return element !== undefined && RADIANT_ELEMENTS.has(element) ? [element] : [];
  });
  return [...elements, ...elements];
};

// Chasca's behaviour: her skill's press enters the Nightsoul Blessing, which drains its points as gcsim does, and a press
// In it leaves the Blessing, and a sprint in it drains points. Galesplitting's six shells are cast at its start as one
// Summon, each shell a single-target hit at its hitmark that takes its enemy in turn, Radiant while the team has a Pyro,
// Hydro, Electro or Cryo bullet for it and Anemo after (burst.go:76-93). The press that leaves the Blessing plays none of
// Its skill's hits and sets no cooldown, as gcsim's does, through the skill's state-ending check. Not built: the Ascension
// Talent's Burning Shadowhunt Shell, and the Constellations that need the shells' energy and follow-up hits
// Constellation 1 needs Bullet Trick's Spiritbinding Conversion, which the Ascension talent does not build
// Constellation 2 needs Bullet Trick's Spirit of the Radiant Shadow stacks, which the Ascension talent does not build
// Constellation 4 needs each Radiant shell's energy and follow-up hit (cons.go:67), which the kit does not build
// Constellation 6 needs Multitarget Fire's charge time and Bullet Trick's Spiritbinding Conversion, neither built
export const createChascaKitBehaviour = ({ readHit, readSecondsList }: KitRecordReader): KitBehaviour => {
  const shellSeconds = readSecondsList("shellHitmarks");
  const radiantShell = readHit("radiantShell");
  const soulseekerShell = readHit("soulseekerShell");
  return {
    burst: {
      onStart: (context) => {
        const { activeCombatant, body, kitEffectState } = context;
        const radiantElements = readRadiantElements(context);
        const shells: KitHit[] = [];
        for (const [index, hitmarkSeconds] of shellSeconds.entries()) {
          const radiantElement = radiantElements[index];
          const shell = radiantElement === undefined ? soulseekerShell : { ...radiantShell, element: radiantElement };
          shells.push({ ...shell, attackTag: AttackTag.ElementalBurst, hitmarkSeconds, targetIndex: index });
        }
        castKitSummon(kitEffectState, body, activeCombatant, shells, { attackTag: AttackTag.ElementalBurst });
      },
    },
    onSprint: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
        drainKitNightsoulPoints(kitEffectState, characterId, NIGHTSOUL_SPRINT_DRAIN);
    },
    skill: {
      checkIsStateEndingPress: ({ activeCombatant, kitEffectState }) =>
        hasKitNightsoulBlessing(kitEffectState.effects, activeCombatant.characterId),
      onStart: ({ activeCombatant, kitEffectState }) => {
        const { characterId } = activeCombatant;
        if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
          exitKitNightsoulBlessing(kitEffectState, characterId);
        else
          enterKitNightsoulBlessing(kitEffectState, characterId, {
            nightsoulRate: { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
            points: NIGHTSOUL_POINTS,
            secondsRemaining: Number.POSITIVE_INFINITY,
          });
      },
    },
  };
};
