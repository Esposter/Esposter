import { GENERATED_PATH, OUTSIDE_PATH } from "#src/services/format/constants.test";
import { listDifferent } from "#src/services/format/listDifferent";
import { OXFMT_BINARY_RELATIVE_PATH } from "#src/services/shared/constants";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(listDifferent, () => {
  const BOUND_MILLISECONDS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
  const SLOWER_THAN_BOUND_MILLISECONDS = Temporal.Duration.from({ seconds: 3 }).total("milliseconds");

  let root: string;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "list-different-")));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  // The formatter runs from the checkout that holds its install, so a script stands in for it in a temporary one
  test("kills a run that outlives its bound, and the error names the command", () => {
    expect.hasAssertions();

    mkdirSync(dirname(join(root, OXFMT_BINARY_RELATIVE_PATH)), { recursive: true });
    writeFileSync(
      join(root, OXFMT_BINARY_RELATIVE_PATH),
      `setTimeout(() => process.stdout.write("late"), ${SLOWER_THAN_BOUND_MILLISECONDS});`,
    );

    expect(() =>
      listDifferent([OUTSIDE_PATH, GENERATED_PATH], root, root, BOUND_MILLISECONDS),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: packages/example/src/kit/Map.ts, oxfmt --list-different over 2 files ran past 1000 ms and was killed]`,
    );
  });
});
