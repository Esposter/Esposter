import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const SEAL_ID = "manyOathsOfDawnAndDuskSeal";
const SEAL_WINDOW_ID = "manyOathsOfDawnAndDuskSealWindow";
const LUNAR_CRYSTALLIZE_COOLDOWN_ID = "manyOathsOfDawnAndDuskLunarCrystallizeCooldown";
// The Seals the wielder holds at most, and the seconds after its skill first deals DMG that they disappear, which the
// Text gives and the rank's params do not
const MAXIMUM_SEAL_COUNT = 2;
const SEAL_WINDOW_SECONDS = 0.2;

// Many Oaths of Dawn and Dusk (Verdict) at its rank. Its ATK line is the table's. A Crystallize shield the party picks
// Up, whoever's reaction left it, or a Lunar-Crystallize the party triggers, at most once every cooldown, gives the
// Wielder a Seal for the rank's seconds, up to two, the Seals' clock restarting with each and their count starting over
// Once it has run out. Its skill's hits deal the rank's DMG Bonus more for each Seal, and its first one opens a window
// After which the Seals disappear, those gained within it included, as gcsim's verdict.go does
export const createManyOathsOfDawnAndDuskPassiveModule = (params: number[]): PassiveModule => {
  const damageBonusPerSeal = takeOne(params, 0);
  const sealSeconds = takeOne(params, 1);
  const lunarCrystallizeCooldownSeconds = takeOne(params, 2);
  const gainSeal = (kitEffectState: KitEffectState, characterId: number) => {
    addKitStatus(kitEffectState, characterId, {
      id: SEAL_ID,
      secondsRemaining: sealSeconds,
      stacks: Math.min(countKitStatusStacks(kitEffectState.effects, characterId, SEAL_ID) + 1, MAXIMUM_SEAL_COUNT),
    });
  };
  return {
    getStrikeDamageBonus: ({ attackTag, combatant }, _enemy, _party, effects) =>
      attackTag === AttackTag.ElementalSkill
        ? countKitStatusStacks(effects, combatant.characterId, SEAL_ID) * damageBonusPerSeal
        : 0,
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind === KitEventKind.ShieldCast && event.shield.isCrystallize) gainSeal(kitEffectState, characterId);
      else if (
        event.kind === KitEventKind.ReactionTriggered &&
        event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarCrystallize) &&
        startKitCooldown(kitEffectState, characterId, LUNAR_CRYSTALLIZE_COOLDOWN_ID, lunarCrystallizeCooldownSeconds)
      )
        gainSeal(kitEffectState, characterId);
      else if (
        event.kind === KitEventKind.EnemyHit &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ElementalSkill &&
        countKitStatusStacks(kitEffectState.effects, characterId, SEAL_ID) > 0 &&
        !checkIsKitStatusActive(kitEffectState.effects, characterId, SEAL_WINDOW_ID)
      ) {
        addKitStatus(kitEffectState, characterId, { id: SEAL_WINDOW_ID, secondsRemaining: SEAL_WINDOW_SECONDS });
        scheduleKitTask(kitEffectState, characterId, SEAL_WINDOW_SECONDS, (context) => {
          removeKitEffects(
            context.kitEffectState,
            (effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === SEAL_ID,
          );
        });
      }
    },
  };
};
