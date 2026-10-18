import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";

// Guoba stands 1.3 metres ahead of the body, as gcsim v2.47.2 (MIT) xiangling/guoba.go places it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xiangling/guoba.go
const GUOBA_OFFSET = 1.3;
// Crossfire, from Ascension 1, widens Guoba's flame by 20%, as the wiki's passive page and gcsim v2.47.2 (MIT)
// Xiangling/asc.go give it
// https://genshin-impact.fandom.com/wiki/Crossfire
const CROSSFIRE_ASCENSION = 1;
// Beware, It's Super Hot!, from Ascension 4, leaves a chili pepper where Guoba disappears for 10 seconds, and the character
// Who picks it up gains 10% ATK for 10 seconds, as the wiki's passive page gives it. Provisional: no source gives the
// Pepper's pickup reach, so the body on the field picks it up within a metre of it
// https://genshin-impact.fandom.com/wiki/Beware,_It%27s_Super_Hot!
const BEWARE_ITS_SUPER_HOT_ASCENSION = 4;
const CHILI_PEPPER_SECONDS = 10;
const CHILI_PEPPER_PICKUP_RADIUS = 1;
const CHILI_PEPPER_ATTACK_SHARE = 0.1;
const CHILI_PEPPER_BUFF_SECONDS = 10;
const CHILI_PEPPER_SOURCE = "Chili Pepper";
// Crispy Outside, Tender Inside, from one constellation, takes 15% off the Pyro RES of each enemy Guoba strikes for 6
// Seconds, as the wiki's constellation page and gcsim v2.47.2 (MIT) xiangling/cons.go give it
// https://genshin-impact.fandom.com/wiki/Crispy_Outside,_Tender_Inside
const CRISPY_OUTSIDE_TENDER_INSIDE_CONSTELLATION = 1;
const CRISPY_OUTSIDE_TENDER_INSIDE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "xiangling-crispy-outside-tender-inside",
  resistanceReduction: { [Element.Pyro]: 0.15 },
  secondsRemaining: 6,
};
// Oil Meets Fire, from two constellations, explodes 2 seconds after the fifth strike's hit, as the wiki's constellation
// Page gives it
// https://genshin-impact.fandom.com/wiki/Oil_Meets_Fire
const OIL_MEETS_FIRE_CONSTELLATION = 2;
// Slowbake, from four constellations, lengthens the Pyronado by 40%, as the wiki's constellation page and gcsim v2.47.2
// (MIT) xiangling/burst.go give it
// https://genshin-impact.fandom.com/wiki/Slowbake
const SLOWBAKE_CONSTELLATION = 4;
const SLOWBAKE_DURATION_MULTIPLIER = 1.4;
// Condensed Pyronado, from six constellations, gives every party member a 15% Pyro DMG Bonus for the Pyronado's seconds,
// From its start, as the wiki's constellation page and gcsim v2.47.2 (MIT) xiangling/cons.go give it
// https://genshin-impact.fandom.com/wiki/Condensed_Pyronado
const CONDENSED_PYRONADO_CONSTELLATION = 6;
const CONDENSED_PYRONADO_PYRO_DAMAGE_BONUS = 0.15;
const CONDENSED_PYRONADO_SOURCE = "Condensed Pyronado";

// Guoba's chili pepper, cast where Guoba disappears for its seconds, which the body on the field picks up by standing
// Within its reach: the character on the field gains its ATK, as a flat share of its base ATK, and the pepper is gone
const castChiliPepper = (
  kitEffectState: KitEffectState,
  owner: Combatant,
  centre: GroundPoint,
  guobaSeconds: number,
): void => {
  const chiliPepper = castKitField(kitEffectState, owner.characterId, centre, {
    nextTickSeconds: guobaSeconds,
    onTick: ({ activeCombatant, kitEffectState: tickKitEffectState }) => {
      buffKitMember(tickKitEffectState, activeCombatant.characterId, {
        amount: CHILI_PEPPER_ATTACK_SHARE * activeCombatant.attributes.attributeTotalMap[Attribute.BaseAttack],
        attribute: Attribute.Attack,
        secondsRemaining: CHILI_PEPPER_BUFF_SECONDS,
        source: CHILI_PEPPER_SOURCE,
      });
      removeKitEffects(tickKitEffectState, (effect) => effect === chiliPepper);
    },
    radius: CHILI_PEPPER_PICKUP_RADIUS,
    secondsRemaining: guobaSeconds + CHILI_PEPPER_SECONDS,
    tickIntervalSeconds: FIXED_STEP_SECONDS,
  });
};

export const XIANGLING_CHARACTER_ID = 10_000_023;

// Xiangling's behaviour: from two constellations, the fifth strike casts Oil Meets Fire's Implode as it starts, a summon
// Where she stands. Guoba Attack casts Guoba ahead of her, breathing its flame, widened from Ascension 1 and taking
// Crispy Outside, Tender Inside's Pyro RES from one constellation, and from Ascension 4 leaving its chili pepper where it
// Stood. Pyronado casts the Pyronado, a summon that follows the body on the field for its seconds, which Slowbake
// Lengthens from four constellations; from six, a task as it starts gives the team Condensed Pyronado's Pyro DMG Bonus
export const createXianglingKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const implode = readHit("implode");
  const guobaBreathBehaviour = {
    enemyStatus: (combatant: Combatant) =>
      combatant.constellationCount >= CRISPY_OUTSIDE_TENDER_INSIDE_CONSTELLATION
        ? CRISPY_OUTSIDE_TENDER_INSIDE_STATUS
        : undefined,
  };
  const guobaBreaths = readHits("guobaBreaths", guobaBreathBehaviour);
  const crossfireGuobaBreaths = readHits("crossfireGuobaBreaths", guobaBreathBehaviour);
  const guobaSeconds = readSeconds("guoba");
  const pyronadoSeconds = readParameter("pyronadoSeconds");
  const pyronadoStartSeconds = readSeconds("pyronadoStart");
  const pyronadoTicks = readHits("pyronadoTicks");
  const slowbakePyronadoTicks = readHits("slowbakePyronadoTicks");
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const isSlowbake = combatant.constellationCount >= SLOWBAKE_CONSTELLATION;
        const seconds = isSlowbake ? SLOWBAKE_DURATION_MULTIPLIER * pyronadoSeconds : pyronadoSeconds;
        castKitSummon(
          kitEffectState,
          { facing, height, position },
          combatant,
          isSlowbake ? slowbakePyronadoTicks : pyronadoTicks,
          { attackTag: AttackTag.ElementalBurst, isFollowing: true, secondsRemaining: pyronadoStartSeconds + seconds },
        );
        if (combatant.constellationCount < CONDENSED_PYRONADO_CONSTELLATION) return;
        scheduleKitTask(
          kitEffectState,
          combatant.characterId,
          pyronadoStartSeconds,
          ({ kitEffectState: tickKitEffectState, party }) => {
            buffKitTeam(tickKitEffectState, party, {
              amount: CONDENSED_PYRONADO_PYRO_DAMAGE_BONUS,
              attribute: Attribute.PyroDamageBonus,
              secondsRemaining: seconds,
              source: CONDENSED_PYRONADO_SOURCE,
            });
          },
        );
      },
    },
    normalAttacks: [
      {},
      {},
      {},
      {},
      {
        onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
          if (combatant.constellationCount < OIL_MEETS_FIRE_CONSTELLATION) return;
          castKitSummon(kitEffectState, { facing, height, position }, combatant, [implode]);
        },
      },
    ],
    skill: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        // Ahead of a body at its facing lies the bearing -sin and -cos of that facing, as computeFacingAngle reads it
        const guobaPosition = {
          x: position.x - Math.sin(facing) * GUOBA_OFFSET,
          z: position.z - Math.cos(facing) * GUOBA_OFFSET,
        };
        castKitSummon(
          kitEffectState,
          { facing, height, position: guobaPosition },
          combatant,
          combatant.ascension >= CROSSFIRE_ASCENSION ? crossfireGuobaBreaths : guobaBreaths,
          { attackTag: AttackTag.ElementalSkill, secondsRemaining: guobaSeconds },
        );
        if (combatant.ascension < BEWARE_ITS_SUPER_HOT_ASCENSION) return;
        castChiliPepper(kitEffectState, combatant, { x: guobaPosition.x, z: guobaPosition.z }, guobaSeconds);
      },
    },
  };
};
