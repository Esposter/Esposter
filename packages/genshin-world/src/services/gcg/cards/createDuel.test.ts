import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { describe } from "vitest";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

export const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
  actingSideIndex: 0,
  cardModules: GcgCardIdModuleMap,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides,
  skillModules: GcgEffectNameSkillModuleMap,
  winnerSideIndex: undefined,
});

describe.todo("createDuel");
