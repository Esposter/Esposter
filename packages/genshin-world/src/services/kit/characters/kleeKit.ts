import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";

// Sparkly Explosion, from four constellations, goes off as Klee leaves the field while Sparks 'n' Splash stands, as the
// Wiki's constellation page and gcsim v2.47.2 (MIT) klee/burst.go give it
// https://genshin-impact.fandom.com/wiki/Sparkly_Explosion
const SPARKLY_EXPLOSION_CONSTELLATION = 4;
// Blazing Delight, from six constellations, gives every party member 10% Pyro DMG Bonus for 25 seconds as Sparks 'n'
// Splash is used, as the wiki's constellation page and gcsim v2.47.2 (MIT) klee/burst.go give it
// https://genshin-impact.fandom.com/wiki/Blazing_Delight
const BLAZING_DELIGHT_CONSTELLATION = 6;
const BLAZING_DELIGHT_PYRO_DAMAGE_BONUS = 0.1;
const BLAZING_DELIGHT_SECONDS = 25;
const BLAZING_DELIGHT_SOURCE = "Blazing Delight";

export const KLEE_CHARACTER_ID = 10_000_029;

// Klee's behaviour: each strike's and the charged attack's bomb, Jumpy Dumpty's bounces and mines and Sparks 'n' Splash's
// Sparks land from summons, the sparks' while she stays on the field, with Sparkly Explosion and Blazing Delight's Pyro DMG
// Bonus
export const createKleeKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  // A bomb lands from a summon cast where Klee stands as the strike starts, as gcsim throws it whatever cancels the strike
  const bombs = readHits("bomb");
  const chargedAttackBomb = readHit("chargedAttackBomb");
  const jumpyDumptyHits = readHits("jumpyDumpty");
  const sparkHits = readHits("spark");
  // The burst stands from its start for its seconds
  const burstSeconds = readSeconds("burstStart") + readParameter("burstSeconds");
  // Sparkly Explosion lands a frame past Klee's leaving, so the step that casts it lands it
  const sparklyExplosion = readHit("sparklyExplosion");

  // Sparks 'n' Splash's sparks land from a summon that follows the body on the field, and a field ticking every step ends
  // Them once another character is on the field, as gcsim ends the burst on a swap. From four constellations that end
  // Sets off Sparkly Explosion where Klee left, priced as she cast the burst, and from six a task runs once and gives
  // Each member of the deployed team Blazing Delight's bonus
  const castSparksNSplash = ({ activeCombatant: combatant, body, kitEffectState }: KitContext): void => {
    const { characterId, constellationCount } = combatant;
    const centre = { x: body.position.x, z: body.position.z };
    const sparks = castKitSummon(kitEffectState, body, combatant, sparkHits, {
      isFollowing: true,
      secondsRemaining: burstSeconds,
    });
    const exit = castKitField(kitEffectState, characterId, centre, {
      nextTickSeconds: 0,
      onTick: ({ activeCombatant, kitEffectState: tickKitEffectState }) => {
        if (activeCombatant.characterId === characterId || !tickKitEffectState.effects.includes(sparks)) return;
        tickKitEffectState.effects = tickKitEffectState.effects.filter(
          (effect) => effect !== sparks && effect !== exit,
        );
        if (constellationCount >= SPARKLY_EXPLOSION_CONSTELLATION)
          castKitSummon(tickKitEffectState, sparks.body, combatant, [sparklyExplosion]);
      },
      secondsRemaining: burstSeconds,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    });
    if (constellationCount < BLAZING_DELIGHT_CONSTELLATION) return;
    scheduleKitTask(kitEffectState, characterId, 0, ({ kitEffectState: tickKitEffectState, party }) => {
      buffKitTeam(tickKitEffectState, party, {
        amount: BLAZING_DELIGHT_PYRO_DAMAGE_BONUS,
        attribute: Attribute.PyroDamageBonus,
        secondsRemaining: BLAZING_DELIGHT_SECONDS,
        source: BLAZING_DELIGHT_SOURCE,
      });
    });
  };

  return {
    burst: { onStart: castSparksNSplash },
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, [chargedAttackBomb]),
    },
    normalAttacks: bombs.map((bomb): KitActionBehaviour => ({
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, [bomb]),
    })),
    // The bounces and mines land from a summon cast where Klee stands as the skill starts
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, jumpyDumptyHits),
    },
  };
};
