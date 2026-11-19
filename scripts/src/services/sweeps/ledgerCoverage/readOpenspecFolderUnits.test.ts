import { toOpenspecFolderUnit } from "#src/services/sweeps/ledgerCoverage/readOpenspecFolderUnits";
import { win32 } from "node:path";
import { describe, expect, test } from "vitest";

describe(toOpenspecFolderUnit, () => {
  test("spells a Windows folder path with forward slashes, as every ledger row is spelled", () => {
    expect.hasAssertions();

    expect(toOpenspecFolderUnit(win32.join("openspec", "changes", "architecture-roadmap"))).toBe(
      "`openspec/changes/architecture-roadmap`",
    );
  });
});
