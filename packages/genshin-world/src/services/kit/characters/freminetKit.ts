import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";

export const FREMINET_CHARACTER_ID = 10_000_085;

// Measured: gcsim (MIT, v2.47.2) freminet/skill.go, skillAligned: each press of the skill queues Spiritbreath Thorn, a
// Cryo Strike at 62 frames, and none is queued again for nine seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/freminet/skill.go
const SKILL_ALIGNED_SECONDS = 9;
const SPIRITBREATH_THORN_STATUS_ID = "freminet-spiritbreath-thorn";
// Measured: gcsim (MIT, v2.47.2) freminet/cons.go, c4c6: Freminet's own attack that triggers a Shatter, Frozen, Superconduct or
// Stellar-Conduct gives him Constellation 4's ATK stacks and, from Constellation 6, its CRIT DMG stacks, each once every 18
// Frames, both lasting six seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/freminet/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_6 = 6;
const CONSTELLATION_PROC_ICD_SECONDS = 0.3;
const CONSTELLATION_PROC_ICD_ID = "freminet-c4-c6-icd";
const CONSTELLATION_PROC_SECONDS = 6;
const CONSTELLATION_4_ID = "freminet-c4";
const CONSTELLATION_4_ATK_PER_STACK = 0.09;
const CONSTELLATION_4_MAXIMUM_STACKS = 2;
const CONSTELLATION_6_ID = "freminet-c6";
const CONSTELLATION_6_CRIT_DAMAGE_PER_STACK = 0.12;
const CONSTELLATION_6_MAXIMUM_STACKS = 3;
const PROC_REACTION_TYPES = new Set<ReactionType>([
  ReactionType.Frozen,
  ReactionType.Shattered,
  ReactionType.StellarConduct,
  ReactionType.Superconduct,
]);

// Freminet's behaviour: his strikes, charged attack, plunges, Pressurized Floe's Upward Thrust and Shadowhunter's Ambush
// Come from his record. Spiritbreath Thorn lands at its hitmark after a press of the skill, unless one queued it within
// The last nine seconds. Constellation 4 and 6 answer his own reactions that Shatter, freeze or conduct. What is not built
// Is listed in openspec/specs/genshin/kits/freminet/design.md
export const createFreminetKitBehaviour = ({ readHit }: KitRecordReader): KitBehaviour => {
  const spiritbreathThorn = readHit("spiritbreathThorn");
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        combatant.constellationCount < CONSTELLATION_4 ||
        !checkIsOwnReactionTriggered(event, combatant) ||
        !event.reactions.some(({ reactionType }) => PROC_REACTION_TYPES.has(reactionType)) ||
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_PROC_ICD_ID,
          CONSTELLATION_PROC_ICD_SECONDS,
        )
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: CONSTELLATION_4_ID,
        maximumStacks: CONSTELLATION_4_MAXIMUM_STACKS,
        perStackBonuses: [{ amount: CONSTELLATION_4_ATK_PER_STACK, attribute: Attribute.AttackPercent }],
        seconds: CONSTELLATION_PROC_SECONDS,
      });
      if (combatant.constellationCount >= CONSTELLATION_6)
        addPassiveStack(kitEffectState, combatant.characterId, {
          id: CONSTELLATION_6_ID,
          maximumStacks: CONSTELLATION_6_MAXIMUM_STACKS,
          perStackBonuses: [{ amount: CONSTELLATION_6_CRIT_DAMAGE_PER_STACK, attribute: Attribute.CriticalDamage }],
          seconds: CONSTELLATION_PROC_SECONDS,
        });
    },
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
