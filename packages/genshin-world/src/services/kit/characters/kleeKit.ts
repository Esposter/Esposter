import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

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
// Explosive Spark, from Ascension 1, gives Klee a 50% chance on each hit of her normal attacks and Jumpy Dumpty to
// Obtain a spark, rolled no more than once each 5 seconds. A spark lasts 30 seconds, and her next charged attack spends
// It for no stamina and 50% more Pyro DMG, as gcsim v2.47.2 (MIT) klee/asc.go and charge.go give it
const EXPLOSIVE_SPARK_ASCENSION = 1;
const EXPLOSIVE_SPARK_CHANCE = 0.5;
const EXPLOSIVE_SPARK_COOLDOWN_SECONDS = 5;
const EXPLOSIVE_SPARK_COOLDOWN_ID = "klee-explosive-spark-cooldown";
const EXPLOSIVE_SPARK_DAMAGE_BONUS = 0.5;
const EXPLOSIVE_SPARK_ID = "klee-explosive-spark";
const EXPLOSIVE_SPARK_SECONDS = 30;
const EXPLOSIVE_SPARK_SOURCE = "Explosive Spark";
// The seconds past the charged attack's hit its spark's damage bonus lasts, so the step that lands the hit still has it
const CHARGED_ATTACK_LINGER_SECONDS = 0.1;

// Sparkling Burst, as the dump's Klee_PermanentSkill_2 row (promote 4) and gcsim v2.47.2 (MIT) klee/asc.go give it: from
// Ascension 4, a CRIT hit of her charged attack's bomb gives every member of the party 2 energy, once in 0.6 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/klee/asc.go
const SPARKLING_BURST_ASCENSION = 4;
const SPARKLING_BURST_ENERGY = 2;
const SPARKLING_BURST_COOLDOWN_SECONDS = 0.6;
const SPARKLING_BURST_COOLDOWN_ID = "klee-sparkling-burst-cooldown";

export const KLEE_CHARACTER_ID = 10_000_029;

// Each hit of her normal attacks or Jumpy Dumpty rolls for a spark once a strike of Klee's with Ascension 1 lands, unless
// The roll is on cooldown, which the roll starts only when it passes
const rollExplosiveSpark = ({ kitEffectState, random }: KitContext, { combatant }: KitStrike): void => {
  if (
    combatant.ascension < EXPLOSIVE_SPARK_ASCENSION ||
    checkHasKitStatus(kitEffectState.effects, KLEE_CHARACTER_ID, EXPLOSIVE_SPARK_COOLDOWN_ID) ||
    random() >= EXPLOSIVE_SPARK_CHANCE
  )
    return;
  addKitStatus(kitEffectState, KLEE_CHARACTER_ID, {
    id: EXPLOSIVE_SPARK_COOLDOWN_ID,
    secondsRemaining: EXPLOSIVE_SPARK_COOLDOWN_SECONDS,
  });
  // A spark already standing is not refreshed, as gcsim's status is not
  if (checkHasKitStatus(kitEffectState.effects, KLEE_CHARACTER_ID, EXPLOSIVE_SPARK_ID)) return;
  addKitStatus(kitEffectState, KLEE_CHARACTER_ID, {
    id: EXPLOSIVE_SPARK_ID,
    secondsRemaining: EXPLOSIVE_SPARK_SECONDS,
  });
};

// Klee's behaviour: each strike's and the charged attack's bomb, Jumpy Dumpty's bounces and mines and Sparks 'n' Splash's
// Sparks land from summons, the sparks' while she stays on the field, with Sparkly Explosion and Blazing Delight's Pyro DMG
// Bonus. From Ascension 4 a CRIT hit of her charged attack gives the party energy
// Constellation 1 needs its spark bombardment, which the kit does not build
// Constellation 2 needs the DEF cut that Jumpy Dumpty's mines apply, which the kit does not build
export const createKleeKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  // A bomb lands from a summon cast where Klee stands as the strike starts, as gcsim throws it whatever cancels the strike
  const bombs = readHits("bomb", { onStrike: rollExplosiveSpark });
  const chargedAttackBomb = readHit("chargedAttackBomb");
  const jumpyDumptyHits = readHits("jumpyDumpty", { onStrike: rollExplosiveSpark });
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
    // A spark is spent as the charged attack starts, and its damage bonus holds until the bomb it powers lands
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitSummon(kitEffectState, body, combatant, [chargedAttackBomb]);
        if (!checkHasKitStatus(kitEffectState.effects, KLEE_CHARACTER_ID, EXPLOSIVE_SPARK_ID)) return;
        removeKitEffects(
          kitEffectState,
          (effect) =>
            effect.kind === "status" && effect.characterId === KLEE_CHARACTER_ID && effect.id === EXPLOSIVE_SPARK_ID,
        );
        buffKitMember(kitEffectState, KLEE_CHARACTER_ID, {
          amount: EXPLOSIVE_SPARK_DAMAGE_BONUS,
          attribute: Attribute.PyroDamageBonus,
          secondsRemaining: chargedAttackBomb.hitmarkSeconds + CHARGED_ATTACK_LINGER_SECONDS,
          source: EXPLOSIVE_SPARK_SOURCE,
        });
      },
    },
    // Her spark is spent by the charged attack alone, which costs none while one stands
    getChargedAttackStaminaMultiplier: ({ kitEffectState }) =>
      checkHasKitStatus(kitEffectState.effects, KLEE_CHARACTER_ID, EXPLOSIVE_SPARK_ID) ? 0 : 1,
    normalAttacks: bombs.map((bomb): KitActionBehaviour => ({
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, [bomb]),
    })),
    // From four constellations her leaving the field while her sparks stand, which the swap has just ended, sets off
    // Sparkly Explosion where they stood, priced as she cast the burst. From Ascension 4 a CRIT hit of her charged attack's
    // Bomb gives each member of the deployed team its energy, unless one did within the cooldown
    onKitEvent: (
      event,
      { characterIdCombatantMap, kitEffectState, party },
      { ascension, characterId, constellationCount },
    ) => {
      if (event.kind === KitEventKind.DamageTaken) {
        if (
          ascension < SPARKLING_BURST_ASCENSION ||
          !event.isCritical ||
          event.hit !== chargedAttackBomb ||
          event.striker.characterId !== characterId ||
          !startKitCooldown(kitEffectState, characterId, SPARKLING_BURST_COOLDOWN_ID, SPARKLING_BURST_COOLDOWN_SECONDS)
        )
          return;
        for (const memberCharacterId of getDeployedCharacterIds(party)) {
          const member = characterIdCombatantMap.get(memberCharacterId);
          if (member) gainPartyMemberEnergy(party, member, SPARKLING_BURST_ENERGY);
        }
        return;
      }
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
