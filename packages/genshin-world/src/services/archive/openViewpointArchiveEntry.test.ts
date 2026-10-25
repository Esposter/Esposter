import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openViewpointArchiveEntry } from "#src/services/archive/openViewpointArchiveEntry";
import { describe, expect, test } from "vitest";

describe(openViewpointArchiveEntry, () => {
  const VIEWPOINT_ID = 90_021;

  test("a reached viewpoint opens its entry when viewed", () => {
    expect.hasAssertions();

    expect(openViewpointArchiveEntry(new Map(), VIEWPOINT_ID).get(ArchiveSection.Geography)).toStrictEqual(
      new Set([VIEWPOINT_ID]),
    );
  });
});
