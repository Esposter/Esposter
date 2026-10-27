import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";

export const DAHLIA_CHARACTER_ID = 10_000_115;

// Constellation 1, Infallible Procession: each Benison stack Dahlia gains returns 2.5 Energy, as the wiki's constellation page gives it
const CONSTELLATION_1 = 1;
const INFALLIBLE_PROCESSION_ENERGY = 2.5;
// Constellation 4, Collect of the Assembly: the Favonian Favor lasts 3 seconds longer, as the wiki's constellation page gives it
const CONSTELLATION_4 = 4;
const FAVONIAN_FAVOR_EXTENSION_SECONDS = 3;
// Benison: a stack comes when his active member hits opponents 4 times with normal attacks during Favonian Favor, up to 4 a
// Favonian Favor, as the wiki's burst page gives it. A counted hit has a 3-frame cooldown before the next one counts, from
// Gcsim's normalAttackStackIcd, as the wiki is silent on it
const BENISON_HITS_PER_STACK = 4;
const BENISON_MAX_STACKS = 4;
const BENISON_HIT_ICD_SECONDS = toKitSeconds(3);
const FAVONIAN_FAVOR_STATUS_ID = "dahlia-favonian-favor";
const BENISON_GENERATED_STATUS_ID = "dahlia-benison-generated";
const BENISON_HITS_STATUS_ID = "dahlia-benison-hits";
const BENISON_HIT_ICD_STATUS_ID = "dahlia-benison-hit-icd";

// Dahlia's behaviour: Radiant Psalter places her Hydro shield for the seconds its Favonian Favor holds. Immersive
// Ordinance's Hydro particles, which gcsim gives on an internal cooldown, wait on the particle hook. Her Benison stacks are
// Counted, and a broken shield is made again from them. That regeneration is not built yet; its two delays are in the records:
// 26 frames after a broken shield, and 31 after a stack is gained with none up (gcsim's burst.go gives them)
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dahlia/burst.go
// Constellation 2 needs the 25% Shield Strength a consumed Benison stack adds, which waits on that regeneration
// Constellation 6 needs the ATK SPD of the active member under Favonian Favor, which no own-kit hook reads
export const createDahliaKitBehaviour = ({ readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const shieldSeconds = readSeconds("radiantPsalterShield");
  const burstShieldFlat = readParameter("radiantPsalterShieldFlatHealth");
  const burstShieldShare = readParameter("radiantPsalterShieldMaxHealthShare");
  const favonianFavorSeconds = readParameter("favonianFavorSeconds");
  return {
    burst: {
      // Radiant Psalter's shield comes its frames in and holds the Favonian Favor's seconds. It is a task, since a shield
      // Is placed when the task runs, and the shield then reads the caster's Max HP as it stands then
      // The Favonian Favor starts with it, and its Benison stacks start from none, as gcsim starts them there
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        scheduleKitTask(kitEffectState, combatant.characterId, shieldSeconds, (tick) => {
          const favonianFavorDuration =
            favonianFavorSeconds +
            (combatant.constellationCount >= CONSTELLATION_4 ? FAVONIAN_FAVOR_EXTENSION_SECONDS : 0);
          const maxHealth = getKitMaxHealth(
            combatant,
            tick.kitEffectState.effects,
            tick.party,
            tick.characterIdCombatantMap,
          );
          castKitShield(tick, combatant.characterId, {
            element: Element.Hydro,
            health: burstShieldShare * maxHealth + burstShieldFlat,
            secondsRemaining: favonianFavorDuration,
          });
          addKitStatus(tick.kitEffectState, combatant.characterId, {
            id: FAVONIAN_FAVOR_STATUS_ID,
            secondsRemaining: favonianFavorDuration,
          });
          addKitStatus(tick.kitEffectState, combatant.characterId, {
            id: BENISON_GENERATED_STATUS_ID,
            secondsRemaining: favonianFavorDuration,
            stacks: 0,
          });
          addKitStatus(tick.kitEffectState, combatant.characterId, {
            id: BENISON_HITS_STATUS_ID,
            secondsRemaining: favonianFavorDuration,
            stacks: 0,
          });
        }),
    },
    // A normal attack hit by the active member counts toward a Benison stack while Favonian Favor holds
    // Each stack gained returns Constellation 1's Energy
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.EnemyHit ||
        event.attackTag !== AttackTag.NormalAttack ||
        event.striker.characterId !== activeCombatant.characterId
      )
        return;
      const { characterId } = combatant;
      const { effects } = kitEffectState;
      const generated = findKitStatus(effects, characterId, BENISON_GENERATED_STATUS_ID);
      const hits = findKitStatus(effects, characterId, BENISON_HITS_STATUS_ID);
      if (
        !findKitStatus(effects, characterId, FAVONIAN_FAVOR_STATUS_ID) ||
        !generated ||
        !hits ||
        (generated.stacks ?? 0) >= BENISON_MAX_STACKS ||
        findKitStatus(effects, characterId, BENISON_HIT_ICD_STATUS_ID)
      )
        return;
      addKitStatus(kitEffectState, characterId, {
        id: BENISON_HIT_ICD_STATUS_ID,
        secondsRemaining: BENISON_HIT_ICD_SECONDS,
      });
      hits.stacks = (hits.stacks ?? 0) + 1;
      if (hits.stacks < BENISON_HITS_PER_STACK) return;
      hits.stacks = 0;
      generated.stacks = (generated.stacks ?? 0) + 1;
      if (combatant.constellationCount >= CONSTELLATION_1)
        gainPartyMemberEnergy(party, combatant, INFALLIBLE_PROCESSION_ENERGY);
    },
  };
};
