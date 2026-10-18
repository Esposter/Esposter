import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Tip } from "#src/models/tip/Tip";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openTipArchiveEntry } from "#src/services/archive/openTipArchiveEntry";
import { describe, expect, test } from "vitest";

const CODEX_ID = 5;
const TIP: Tip = { codexId: CODEX_ID, id: 1, subtitleTextId: "", titleTextId: "" };

describe(openTipArchiveEntry, () => {
  test("a tutorial's entry opens when its tip is first shown", () => {
    expect.hasAssertions();
    const progress: ArchiveProgress = new Map();
    expect(openTipArchiveEntry(progress, TIP).get(ArchiveSection.Tutorials)).toStrictEqual(new Set([CODEX_ID]));
  });

  test("a tutorial's entry stays as it was when its tip is shown again", () => {
    expect.hasAssertions();
    const opened = openTipArchiveEntry(new Map(), TIP);
    expect(openTipArchiveEntry(opened, TIP)).toStrictEqual(opened);
  });
});
