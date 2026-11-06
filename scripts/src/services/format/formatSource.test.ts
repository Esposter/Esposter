import { OUTSIDE_PATH } from "#src/services/format/constants.test";
import { formatSource } from "#src/services/format/formatSource";
import { OXFMT_BINARY_RELATIVE_PATH } from "#src/services/shared/constants";
import { KIBIBYTE } from "@esposter/configuration";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(formatSource, () => {
  // Longer than a pipe's buffer, so the source only arrives whole if the formatter reads all of its stdin
  const LARGER_THAN_A_PIPE_LENGTH = KIBIBYTE * 256;
  const BOUND_MILLISECONDS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
  const SLOWER_THAN_BOUND_MILLISECONDS = Temporal.Duration.from({ seconds: 3 }).total("milliseconds");

  let root: string;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "format-source-")));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  // The formatter runs from the checkout that holds its install, so a script stands in for it in a temporary one
  const writeFormatter = (script: string): void => {
    mkdirSync(dirname(join(root, OXFMT_BINARY_RELATIVE_PATH)), { recursive: true });
    writeFileSync(join(root, OXFMT_BINARY_RELATIVE_PATH), script);
  };

  test("kills a formatter that outlives its bound, and the error names the file and the command", () => {
    expect.hasAssertions();

    writeFormatter(`setTimeout(() => process.stdout.write("late"), ${SLOWER_THAN_BOUND_MILLISECONDS});`);

    expect(() =>
      formatSource("source", OUTSIDE_PATH, root, root, BOUND_MILLISECONDS),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, OUTSIDE_PATH, `oxfmt --stdin-filepath ${OUTSIDE_PATH} ran past ${BOUND_MILLISECONDS} ms and was killed`).message}]`,
    );
  });

  test("a source longer than a pipe's buffer reaches the formatter whole and comes back whole", () => {
    expect.hasAssertions();

    writeFormatter(
      `let input = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", (chunk) => { input += chunk; }); process.stdin.on("end", () => process.stdout.write(input));`,
    );
    const source = "x".repeat(LARGER_THAN_A_PIPE_LENGTH);

    expect(formatSource(source, OUTSIDE_PATH, root, root)).toBe(source);
  });
});
