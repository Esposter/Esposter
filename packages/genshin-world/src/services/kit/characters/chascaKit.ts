import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { createNightsoulBlessingStart } from "#src/services/kit/createNightsoulBlessingStart";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { drainKitSprintNightsoulPoints } from "#src/services/kit/effects/drainKitSprintNightsoulPoints";
import { shuffleWithRandom } from "#src/services/shared/shuffleWithRandom";

export const CHASCA_CHARACTER_ID = 10_000_104;

// Her blessing starts with 80 points, which drain eight a second, 0.8 each six frames, and a sprint in it drains 13.3
// More, as gcsim (MIT) chasca/skill.go enterNightsoul and reduceNightsoulPoints and chasca/dash.go do
const NIGHTSOUL_POINTS = 80;
const NIGHTSOUL_DRAIN_PER_SECOND = 8;
const NIGHTSOUL_SPRINT_DRAIN = 13.3;

// The elements a Radiant shell takes from the team, as gcsim's Pyro, Hydro, Electro and Cryo bullet types do
const RADIANT_ELEMENTS = new Set<Element>([Element.Cryo, Element.Electro, Element.Hydro, Element.Pyro]);

// The team's Radiant shells in the order the world's random source deals them: each Pyro, Hydro, Electro or Cryo member's
// Element twice over, as galesplitting's bullets are (burst.go:69-74), shuffled by that source as gcsim shuffles them
const readRadiantElements = ({ activeCombatant, random }: KitContext): Element[] => {
  const elements = (activeCombatant.deployedElements ?? []).flatMap((element) =>
    element !== undefined && RADIANT_ELEMENTS.has(element) ? [element] : [],
  );
  return shuffleWithRandom([...elements, ...elements], random);
};

// Chasca's behaviour: her skill's press enters the Nightsoul Blessing, which drains its points as gcsim does, and a
// Press in it leaves the Blessing, and a sprint in it drains points. Galesplitting's six shells are cast at its start
// As one summon, each shell a single-target hit at its hitmark that takes its enemy in turn, Radiant while the team has
// A Pyro, Hydro, Electro or Cryo bullet for it and Anemo after (burst.go:76-93). The press that leaves the Blessing
// Plays none of its skill's hits, as gcsim's does, through the skill's state-ending check. The cooldown the entering
// Press sets is held while the Blessing lasts, so it runs from the Blessing's end, as gcsim's exit sets it, whether she
// Leaves by a press or her points drain to none (skill.go exitNightsoul). Not built: the Ascension Talent's Burning
// Shadowhunt Shell, and the Constellations that need the shells' energy and follow-up hits
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
    onSprint: (context, kitState, stepSeconds) => {
      drainKitSprintNightsoulPoints(context, kitState, stepSeconds, NIGHTSOUL_SPRINT_DRAIN);
    },
    onStep: ({ kitEffectState, party }, { characterId }, stepSeconds) => {
      if (checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID))
        changeKitSkillCooldown(party, characterId, stepSeconds);
    },
    skill: {
      checkIsStateEndingPress: ({ activeCombatant, kitEffectState }) =>
        checkHasKitStatus(kitEffectState.effects, activeCombatant.characterId, NIGHTSOUL_BLESSING_STATUS_ID),
      onStart: createNightsoulBlessingStart(NIGHTSOUL_POINTS, NIGHTSOUL_DRAIN_PER_SECOND),
    },
  };
};
