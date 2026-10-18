import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { checkIsInSourcewaterPickupArea } from "#src/services/kit/checkIsInSourcewaterPickupArea";
import { KIT_FRAMES_PER_SECOND } from "#src/services/kit/constants";
import { absorbSourcewaterDroplets } from "#src/services/kit/effects/absorbSourcewaterDroplets";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim v2.47.2 (MIT) neuvillette/charge.go, ChargeAttack and chargeJudgementTick. The charge's legal evaluation
// Starts three frames in and runs 209 frames less 57, 111 or 209 for the one, two or three Sourcewater Droplets it picks up.
// The judgement then lasts 173 frames, its eight waves landing 6, 28, 53, 78, 103, 128, 153 and 173 frames after it starts,
// Its HP drains take 8% of Max HP at 40 frames and every 30 after while HP is above half, and each droplet picked up heals
// 16% of Max HP five frames later
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/neuvillette/charge.go
const DECIDED_FRAMES = 3;
const INITIAL_LEGAL_EVALUATION_FRAMES = 209;
const LEGAL_EVALUATION_REDUCTION_FRAMES = [0, 57, 111, 209];
const JUDGEMENT_FRAMES = 173;
// The end lag of the action the charge is cancelled into is not known here, so the default one gcsim gives an action is used
const END_LAG_FRAMES = 51;
const MAX_PICKED_UP_DROPLETS = 3;
const DROPLET_HEAL_FRAMES = 5;
const DROPLET_HEAL_HEALTH_SHARE = 0.16;
const DRAIN_FRAMES = [40, 70, 100, 130, 160];
const DRAIN_HEALTH_SHARE = 0.08;
const DRAIN_HEALTH_SHARE_FLOOR = 0.5;

type DecideLength = NonNullable<KitAction["decideLength"]>;

// Decides the judgement's length as it starts, once its legal evaluation has picked up the droplets: it queues the waves,
// The drains and the droplets' heals from that moment, and returns the frames the charge lasts. The waves are read as the
// Named list of the judgement's hits, whose hitmarks run from the start of the judgement
const decideEquitableJudgement = (context: KitContext, waves: KitHit[]): number => {
  const { activeCombatant, body, kitEffectState } = context;
  const {
    attributes: { maxHealth },
    characterId,
  } = activeCombatant;
  const pickedUp = absorbSourcewaterDroplets(
    kitEffectState,
    characterId,
    (centre) => checkIsInSourcewaterPickupArea(body, centre),
    MAX_PICKED_UP_DROPLETS,
  );
  for (let index = 0; index < pickedUp; index++)
    scheduleKitTask(kitEffectState, characterId, DROPLET_HEAL_FRAMES / KIT_FRAMES_PER_SECOND, (tick) => {
      changeKitMemberHealth(tick, activeCombatant, characterId, DROPLET_HEAL_HEALTH_SHARE * maxHealth);
    });
  const legalEvaluationFrames = INITIAL_LEGAL_EVALUATION_FRAMES - LEGAL_EVALUATION_REDUCTION_FRAMES[pickedUp];
  for (const wave of waves)
    scheduleKitTask(
      kitEffectState,
      characterId,
      legalEvaluationFrames / KIT_FRAMES_PER_SECOND + wave.hitmarkSeconds,
      (tick) => {
        queueKitPassiveHit(tick, activeCombatant, wave);
      },
    );
  for (const frames of DRAIN_FRAMES)
    scheduleKitTask(kitEffectState, characterId, (legalEvaluationFrames + frames) / KIT_FRAMES_PER_SECOND, (tick) => {
      if (getPartyMember(tick.party, characterId).healthShare > DRAIN_HEALTH_SHARE_FLOOR)
        changeKitMemberHealth(tick, activeCombatant, characterId, -DRAIN_HEALTH_SHARE * maxHealth);
    });
  return (DECIDED_FRAMES + legalEvaluationFrames + JUDGEMENT_FRAMES + END_LAG_FRAMES) / KIT_FRAMES_PER_SECOND;
};

// Equitable Judgment's length, decided once its legal evaluation has run, the waves read from the record as it starts
export const createEquitableJudgementLength = (readWaves: () => KitHit[]): DecideLength => ({
  atSeconds: DECIDED_FRAMES / KIT_FRAMES_PER_SECOND,
  decide: (context) => decideEquitableJudgement(context, readWaves()),
});
