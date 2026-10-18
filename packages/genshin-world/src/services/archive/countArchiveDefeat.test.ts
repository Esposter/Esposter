import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { countArchiveDefeat } from "#src/services/archive/countArchiveDefeat";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";
import { describe, expect, test } from "vitest";

describe(countArchiveDefeat, () => {
  const ENTRY_ID = 1;
  const emptyKills: ArchiveKills = new Map();
  const emptyProgress: ArchiveProgress = new Map();

  test("the first defeat opens an enemy's entry with a count of one", () => {
    expect.hasAssertions();

    expect(openArchiveEntry(emptyProgress, ArchiveSection.LivingBeings, ENTRY_ID)).toStrictEqual(
      new Map([[ArchiveSection.LivingBeings, new Set([ENTRY_ID])]]),
    );
    expect(countArchiveDefeat(emptyKills, ENTRY_ID)).toStrictEqual(new Map([[ENTRY_ID, 1]]));
  });

  test("a later defeat raises an enemy's count", () => {
    expect.hasAssertions();

    expect(countArchiveDefeat(new Map([[ENTRY_ID, 1]]), ENTRY_ID)).toStrictEqual(new Map([[ENTRY_ID, 2]]));
  });
});
