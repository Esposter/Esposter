import { readFileSize } from "#src/services/sweeps/ledgerCoverage/readFileSize";
import { describe, expect, test } from "vitest";

describe(readFileSize, () => {
  test("a tracked file the working tree no longer holds weighs nothing rather than throwing", () => {
    expect.hasAssertions();
    expect(readFileSize("apps/web/app/deleted-without-git-rm.ts")).toStrictEqual({ files: 0, lines: 0 });
  });
});
