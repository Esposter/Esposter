import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// The Stormeye stands 5 metres ahead of the body, as gcsim v2.47.2 (MIT) venti/burst.go places it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/venti/burst.go
const STORMEYE_OFFSET = 5;
// Splitting Gales, from one constellation, looses two more arrows with each aimed shot, as the wiki's constellation page
// Gives it. gcsim v2.47.2 (MIT) venti/cons.go lands them with the shot
// https://genshin-impact.fandom.com/wiki/Splitting_Gales
const SPLITTING_GALES_CONSTELLATION = 1;
// Breeze of Reminiscence, from two constellations, takes 12% off the Anemo RES of each enemy Skyward Sonnet strikes for 10
// Seconds, as the wiki's constellation page and gcsim v2.47.2 (MIT) venti/cons.go give it
// https://genshin-impact.fandom.com/wiki/Breeze_of_Reminiscence
const BREEZE_OF_REMINISCENCE_CONSTELLATION = 2;
const BREEZE_OF_REMINISCENCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "venti-breeze-of-reminiscence",
  resistanceReduction: { [Element.Anemo]: 0.12 },
  secondsRemaining: 10,
};
// Stormeye, from Ascension 4, regenerates 15 energy for Venti once the Stormeye's seconds end, as the wiki's passive page
// And gcsim v2.47.2 (MIT) venti/asc.go give it, which gcsim's burst.go queues 480 frames past the Stormeye's start
// https://genshin-impact.fandom.com/wiki/Stormeye
const STORMEYE_PASSIVE_ASCENSION = 4;
const STORMEYE_PASSIVE_ENERGY = 15;
// Storm of Defiance, from six constellations, takes 20% off the Anemo RES of each enemy the Stormeye strikes, for gcsim
// V2.47.2 (MIT) venti/cons.go's 600 frames
// https://genshin-impact.fandom.com/wiki/Storm_of_Defiance
const STORM_OF_DEFIANCE_CONSTELLATION = 6;
const STORM_OF_DEFIANCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "venti-storm-of-defiance",
  resistanceReduction: { [Element.Anemo]: 0.2 },
  secondsRemaining: 10,
};

export const VENTI_CHARACTER_ID = 10_000_022;

// Venti's behaviour: from one constellation, the aimed shot casts Splitting Gales' arrows, and from two Skyward Sonnet's
// Press and hold take Breeze of Reminiscence's Anemo RES. Wind's Grand Ode casts the Stormeye ahead of him, its ticks
// Taking Storm of Defiance's Anemo RES from six constellations, and from Ascension 4 a task as its seconds end gives him
// Its energy
// Constellation 2 needs a Physical RES cut, which EnemyStatus cannot key, and a launched state, not built
// Constellation 6's RES cut on an absorbed element, which the kit does not build
// Constellation 4 needs the Elemental Orb or Particle pickup and the team's buff after his skill and burst, not built
export const createVentiKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const splittingGalesHits = readHits("splittingGalesArrows");
  const stormeyeHits = readHits("stormeyeTicks", {
    enemyStatus: (combatant) =>
      combatant.constellationCount >= STORM_OF_DEFIANCE_CONSTELLATION ? STORM_OF_DEFIANCE_STATUS : undefined,
  });
  const stormeyeSeconds = readParameter("stormeyeSeconds");
  const stormeyeStartSeconds = readSeconds("stormeyeStart");
  const windDomainHitBehaviour: KitHitBehaviour = {
    enemyStatus: (combatant) =>
      combatant.constellationCount >= BREEZE_OF_REMINISCENCE_CONSTELLATION ? BREEZE_OF_REMINISCENCE_STATUS : undefined,
  };
  return {
    // The Stormeye is a summon cast ahead of where Venti faces, landing its ticks from there. From Ascension 4, a task runs
    // As the Stormeye's seconds end, giving Venti his energy up to what his burst costs
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        // Ahead of a body at its facing lies the bearing -sin and -cos of that facing, as computeFacingAngle reads it
        const stormeyePosition = {
          x: position.x - Math.sin(facing) * STORMEYE_OFFSET,
          z: position.z - Math.cos(facing) * STORMEYE_OFFSET,
        };
        castKitSummon(kitEffectState, { facing, height, position: stormeyePosition }, combatant, stormeyeHits);
        if (combatant.ascension < STORMEYE_PASSIVE_ASCENSION) return;
        const passiveSeconds = stormeyeStartSeconds + stormeyeSeconds;
        scheduleKitTask(kitEffectState, combatant.characterId, passiveSeconds, ({ party }) =>
          gainPartyMemberEnergy(party, combatant, STORMEYE_PASSIVE_ENERGY),
        );
      },
    },
    // From one constellation, the shot's start casts Splitting Gales' arrows, landing with it from where Venti stands
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.constellationCount < SPLITTING_GALES_CONSTELLATION) return;
        castKitSummon(kitEffectState, body, combatant, splittingGalesHits);
      },
    },
    skill: { hits: [windDomainHitBehaviour] },
    skillHolds: [{ hits: [windDomainHitBehaviour] }],
  };
};
