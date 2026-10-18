import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { StatTables } from "#src/models/character/StatTables";

import { assert, describe } from "vitest";

// The bonus a set gives once its wearer has the pieces given, read from the game's stat tables
export const getArtifactSetBonus = (statTables: StatTables, setId: number, pieceCount: number): ArtifactSetBonus => {
  const bonus = statTables.artifactSetDataMap.get(setId)?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe.todo("getArtifactSetBonus");
