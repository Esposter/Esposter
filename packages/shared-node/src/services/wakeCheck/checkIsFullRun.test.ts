import { checkIsFullRun } from "#src/services/wakeCheck/checkIsFullRun";
import { describe, expect, test } from "vitest";

describe(checkIsFullRun, () => {
  test.each([[["run"]], [["run", "--coverage"]], [["run", "--reporter=default", "--reporter=blob"]]])(
    "%j is a full run",
    (args) => {
      expect.hasAssertions();

      expect(checkIsFullRun(args)).toBe(true);
    },
  );

  test.each([
    [["run", "--changed"]],
    [["run", "--related", "src/a.ts"]],
    [["run", "-t", "a name"]],
    [["run", "--testNamePattern=a name"]],
    [["run", "--project=web"]],
    [["run", "--project", "web"]],
    [["run", "--shard=1/8"]],
    [["run", "--shard", "1/8"]],
    [["run", "src/a.test.ts"]],
  ])("%j is a subset run", (args) => {
    expect.hasAssertions();

    expect(checkIsFullRun(args)).toBe(false);
  });
});
