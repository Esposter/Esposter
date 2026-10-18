import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// Measured: gcsim (MIT) aino/burst.go, Cool Your Jets Ducky's Water Balls fall for 14.2 seconds from the first, each on a
// Random enemy within 10 metres of the body. Ascension 1's faster and wider balls at Ascendant Gleam are read as the burst
// Is cast
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/aino
const ASCENSION_4 = 4;
// Ascension 1 at Ascendant Gleam, as gcsim's aino/asc.go gives the balls: one every 0.7 seconds, each landing with a radius
// Of 4 metres where the base ball's is 1
const ASCENSION_1 = 1;
const ASCENSION_1_WATER_BALL_INTERVAL_SECONDS = 0.7;
const ASCENSION_1_WATER_BALL_RADIUS = 4;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_SECONDS = 10;
const CONSTELLATION_4_ENERGY = 10;
const CONSTELLATION_4_STATUS_ID = "aino-constellation-4";

export const AINO_CHARACTER_ID = 10_000_121;

// Aino's behaviour: Cool Your Jets Ducky casts a field following the body, which drops a Water Ball every interval from
// Its first tick to its last, and Ascension 4 adds half her Elemental Mastery to each ball's damage. Ascension 1 at
// Ascendant Gleam drops the balls faster and wider, read as the burst is cast. Constellation 4 gives her 10 energy on each
// Skill hit that strikes an enemy, once every ten seconds, as gcsim does. Not built yet: the internal cooldown gcsim gives
// Those Moonsign hits, which the kit has no tag for, and Constellation 6's Lunar DMG bonus, which waits on the Lunar hook;
// Constellation 2's ball on each enemy another member hits while the burst lasts, which waits on a hook that reads another
// Member's hits; Constellation 1's Elemental Mastery on the active member, which the kit does not re-add on each swap.
// Musecatcher's hold is not built, as gcsim does not implement it either
export const createAinoKitBehaviour = ({ kit, readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const masteryShare = readParameter("ascension4MasteryShare");
  const burstFirstTickSeconds = readSeconds("burstStart");
  // gcsim queues each ball at its hitmark from the burst's start, a tick at a time, and a summon's hits count from its own
  // Spawn, so a ball lands its hitmark less the first tick's seconds past the tick that drops it
  const waterBallHit = readHit("waterBall", {
    additiveBaseDamageBonus: (combatant) =>
      combatant.ascension >= ASCENSION_4
        ? combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * masteryShare
        : 0,
  });
  const waterBall: KitHit = { ...waterBallHit, hitmarkSeconds: waterBallHit.hitmarkSeconds - burstFirstTickSeconds };
  const burstTickIntervalSeconds = readSeconds("waterBallInterval");
  const burstSeconds = readSeconds("burstDuration");
  const burstRadius = readParameter("burstRadius");
  // The ball Ascension 1 drops at Ascendant Gleam, whose reach is the burst's search radius with its own landing radius
  const ascendantWaterBall: KitHit = {
    ...waterBall,
    hitArea: { ...waterBall.hitArea, radius: burstRadius + ASCENSION_1_WATER_BALL_RADIUS },
  };
  const skillHits = kit.elementalSkill.hits;
  return {
    burst: {
      onStart: ({
        activeCombatant: combatant,
        body: { facing, height, position },
        characterIdCombatantMap,
        kitEffectState,
        party,
      }) => {
        const isAscendantBurst =
          combatant.ascension >= ASCENSION_1 &&
          getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
        const burstField = castKitField(kitEffectState, combatant.characterId, position, {
          isFollowing: true,
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) =>
            castKitSummon(tickKitEffectState, { facing, height, position: burstField.centre }, combatant, [
              isAscendantBurst ? ascendantWaterBall : waterBall,
            ]),
          radius: burstRadius,
          secondsRemaining: burstFirstTickSeconds + burstSeconds,
          tickIntervalSeconds: isAscendantBurst ? ASCENSION_1_WATER_BALL_INTERVAL_SECONDS : burstTickIntervalSeconds,
        });
      },
    },
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        combatant.constellationCount < CONSTELLATION_4 ||
        event.striker.characterId !== combatant.characterId ||
        !skillHits.includes(event.hit) ||
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, CONSTELLATION_4_STATUS_ID)
      )
        return;
      addKitStatus(kitEffectState, combatant.characterId, {
        id: CONSTELLATION_4_STATUS_ID,
        secondsRemaining: CONSTELLATION_4_COOLDOWN_SECONDS,
      });
      gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
    },
  };
};
