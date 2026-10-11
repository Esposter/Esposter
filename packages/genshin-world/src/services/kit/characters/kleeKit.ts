import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
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
const SPARKS_ID = "klee-sparks";

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

  // Sparks 'n' Splash's sparks land from a summon that follows the body on the field, which her leaving the field ends, as
  // Gcsim ends the burst on a swap, and from six constellations a task runs once and gives each member of the deployed
  // Team Blazing Delight's bonus
  const castSparksNSplash = ({ activeCombatant: combatant, body, kitEffectState }: KitContext): void => {
    const { characterId, constellationCount } = combatant;
    castKitSummon(kitEffectState, body, combatant, sparkHits, {
      id: SPARKS_ID,
      isEndedOnSwap: true,
      isFollowing: true,
      secondsRemaining: burstSeconds,
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
    // From four constellations her leaving the field while her sparks stand, which the swap has just ended, sets off
    // Sparkly Explosion where they stood, priced as she cast the burst
    onKitEvent: (event, { kitEffectState }, { characterId, constellationCount }) => {
      if (
        event.kind !== KitEventKind.CharacterSwapped ||
        event.previousCharacterId !== characterId ||
        constellationCount < SPARKLY_EXPLOSION_CONSTELLATION
      )
        return;
      const sparks = findStandingKitSummon(kitEffectState.effects, SPARKS_ID, characterId);
      if (sparks) castKitSummon(kitEffectState, sparks.body, sparks.combatant, [sparklyExplosion]);
    },
    // The bounces and mines land from a summon cast where Klee stands as the skill starts
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, jumpyDumptyHits),
    },
  };
};
