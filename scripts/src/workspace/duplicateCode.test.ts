import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import {
  DUPLICATE_CODE_FORMATS,
  DUPLICATE_CODE_IGNORED_GLOBS,
  DUPLICATE_CODE_SCOPES,
  MIN_DUPLICATE_LINES,
  MIN_DUPLICATE_TOKENS,
} from "#src/services/sweeps/duplicateCode/constants";
import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The duplicate-code sweep's zero, held over each unit it has brought to no finding: a clone with either side in one
 * of them fails, whatever the other side's unit. A unit joins as its ledger row is swept to none, until the scan finds
 * none anywhere and the scope is the whole of it (`.agents/ledgers/quality/duplicate-code.md`)
 */
describe("duplicate code", () => {
  const ZERO_UNITS = ["packages/genshin-world/"];

  test("finds no clone in a unit swept to none", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(
      readDuplicateCodeFindings().filter(({ paths }) =>
        paths.some((path) => ZERO_UNITS.some((unit) => path.startsWith(unit))),
      ),
    ).toStrictEqual([]);
  });
});

/**
 * The jscpd gate in CI scans what the finder scans, with the finder's globs and minimums, so a clone the gate fails on is
 * one the sweep reports. Two copies of the same settings, held equal here, so neither can drift from the other
 */
describe("jscpd gate", () => {
  test("reads the finder's formats, globs and minimums from its config", () => {
    expect.hasAssertions();

    expect(JSON.parse(readFileSync(join(REPOSITORY_ROOT, ".jscpd.json"), "utf8"))).toStrictEqual({
      format: DUPLICATE_CODE_FORMATS,
      gitignore: false,
      ignore: DUPLICATE_CODE_IGNORED_GLOBS,
      minLines: MIN_DUPLICATE_LINES,
      minTokens: MIN_DUPLICATE_TOKENS,
      reporters: ["console"],
      threshold: 0,
    });
  });

  test("scans the finder's scopes", () => {
    expect.hasAssertions();

    expect(readFileSync(join(REPOSITORY_ROOT, ".github/workflows/CI.yaml"), "utf8")).toContain(
      `path: ${DUPLICATE_CODE_SCOPES.join(" ")}\n`,
    );
  });
});
