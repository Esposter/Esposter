import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";

import {
  AREA_ID,
  CENTER,
  CHAMBER,
  ENEMY_KIND_IDS,
  FLOOR,
  STARTED_AT,
  TEAMS,
} from "#src/services/spiralAbyss/constants.test";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe } from "vitest";

// The arena a chamber with its party set starts, which the scenarios that fight it take as entered
export const enterArenaChamber = (): AbyssArena => {
  const arena = createAbyssArena(FLOOR, CHAMBER, TEAMS, ENEMY_KIND_IDS, AREA_ID, CENTER, STARTED_AT);
  if (!arena) throw new InvalidOperationError(Operation.Read, enterArenaChamber.name, `chamber ${CHAMBER.id}`);
  return arena;
};

describe.todo("enterArenaChamber");
