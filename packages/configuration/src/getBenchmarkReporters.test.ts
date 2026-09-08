import { getBenchmarkReporters } from "#src/getBenchmarkReporters";
import { afterEach, describe, expect, test } from "vitest";

describe(getBenchmarkReporters, () => {
  const ORIGINAL_ARGV = process.argv;

  afterEach(() => {
    process.argv = ORIGINAL_ARGV;
  });

  test("reports through the colocated reporter on a bench run", () => {
    expect.hasAssertions();

    process.argv = ["node", "vitest.mjs", "bench", "--run", "scripts/"];

    expect(getBenchmarkReporters()).toStrictEqual(["default", "@esposter/shared-node/reporter"]);
  });

  // The word reaches argv as a filter and as a project name too, and either would hand an ordinary run the
  // Reporter that rewrites every `*.bench.md` it passes, plus the hour-long timeout a bench is allowed.
  test.each([
    ["run", "bench"],
    ["--project", "bench"],
    ["watch", "src/getBenchmarkReporters.bench.ts"],
  ])("leaves Vitest's own reporters in place for `vitest %s %s`", (...commandArguments) => {
    expect.hasAssertions();

    process.argv = ["node", "vitest.mjs", ...commandArguments];

    expect(getBenchmarkReporters()).toBeUndefined();
  });
});
