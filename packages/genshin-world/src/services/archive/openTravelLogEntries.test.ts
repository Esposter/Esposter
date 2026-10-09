import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { TravelLogEntry } from "#src/models/archive/TravelLogEntry";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openTravelLogEntries } from "#src/services/archive/openTravelLogEntries";
import { describe, expect, test } from "vitest";

describe(openTravelLogEntries, () => {
  const entries: TravelLogEntry[] = [
    { id: 10, nameTextId: "nameTextId", questId: 351 },
    { id: 20, nameTextId: "nameTextId", questId: 352 },
  ];

  test("opens the entries of the main quests finished, and keeps those already open", () => {
    expect.hasAssertions();

    const progress: ArchiveProgress = new Map([[ArchiveSection.TravelLog, new Set([20])]]);

    expect(openTravelLogEntries(progress, entries, new Set([351]))).toStrictEqual(
      new Map([[ArchiveSection.TravelLog, new Set([20, 10])]]),
    );
  });

  test("opens nothing for a quest not finished", () => {
    expect.hasAssertions();

    expect(openTravelLogEntries(new Map(), entries, new Set())).toStrictEqual(
      new Map([[ArchiveSection.TravelLog, new Set()]]),
    );
  });
});
