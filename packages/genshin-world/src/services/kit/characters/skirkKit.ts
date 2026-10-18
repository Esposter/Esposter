import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";

export const SKIRK_CHARACTER_ID = 10_000_114;

// Skirk's behaviour: Seven-Phase Flash's press lands no hit, and a task enters its stance once the press's delay has run,
// Ending as she leaves the field. The stance plays its own Cryo strikes and charged attack, which deal Normal and Charged
// Attack DMG as gcsim's AttackTag of each hit reads, and Havoc: Extinction in place of Havoc: Ruin, while a press of its
// Skill is blocked by the cooldown the press set. Havoc: Extinction's normal attacks' bonus and the void rifts' absorption
// Are not built, nor is Serpent's Subtlety, which gates her burst in place of Energy. An early end of the stance, by a
// Swap, is not counted toward the skill's cooldown, as the cooldown is set at the press
// Constellation 1 needs the Ascension talent Reason Beyond Reason's enhancement, which the kit does not build
// Constellation 2 needs the Serpent's Subtlety gained after Havoc: Warp, which the kit does not build
// Constellation 4 needs the Ascension talent Return to Oblivion's enhancement, which the kit does not build
// Constellation 6 needs the Void Rifts absorbed through Reason Beyond Reason, which the kit does not build
export const createSkirkKitBehaviour = ({ readSeconds, readStance }: KitRecordReader): KitBehaviour => {
  const sevenPhaseFlashSeconds = readSeconds("sevenPhaseFlash");
  const skillDelaySeconds = readSeconds("sevenPhaseFlashDelay");
  const sevenPhaseFlash = readStance("sevenPhaseFlash");
  return {
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        scheduleKitTask(kitEffectState, combatant.characterId, skillDelaySeconds, ({ kitEffectState: tickState }) =>
          enterKitStance(tickState, combatant, sevenPhaseFlash, sevenPhaseFlashSeconds, { isEndedOnSwap: true }),
        ),
    },
  };
};
