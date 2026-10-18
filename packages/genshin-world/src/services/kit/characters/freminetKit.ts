import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";

export const FREMINET_CHARACTER_ID = 10_000_085;

// Measured: gcsim (MIT, v2.47.2) freminet/skill.go, skillAligned: each press of the skill queues Spiritbreath Thorn, a
// Cryo Strike at 62 frames, and none is queued again for nine seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/freminet/skill.go
const SKILL_ALIGNED_SECONDS = 9;
const SPIRITBREATH_THORN_STATUS_ID = "freminet-spiritbreath-thorn";

// Freminet's behaviour: his strikes, charged attack, plunges, Pressurized Floe's Upward Thrust and Shadowhunter's Ambush
// Come from his record. Spiritbreath Thorn lands at its hitmark after a press of the skill, unless one queued it within
// The last nine seconds. What is not built is listed in openspec/specs/genshin/kits/freminet/design.md
export const createFreminetKitBehaviour = ({ readHit }: KitRecordReader): KitBehaviour => {
  const spiritbreathThorn = readHit("spiritbreathThorn");
  return {
    skill: {
      onStart: ({ activeCombatant, kitEffectState }) => {
        const { characterId } = activeCombatant;
        if (checkIsKitStatusActive(kitEffectState.effects, characterId, SPIRITBREATH_THORN_STATUS_ID)) return;
        addKitStatus(kitEffectState, characterId, {
          id: SPIRITBREATH_THORN_STATUS_ID,
          secondsRemaining: SKILL_ALIGNED_SECONDS,
        });
        scheduleKitTask(kitEffectState, characterId, spiritbreathThorn.hitmarkSeconds, (tickContext) => {
          queueKitPassiveHit(tickContext, activeCombatant, spiritbreathThorn);
        });
      },
    },
  };
};
