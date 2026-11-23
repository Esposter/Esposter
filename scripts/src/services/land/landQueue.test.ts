import { LANDING_EXIT_STATUS } from "#src/services/land/constants";
import { landQueue } from "#src/services/land/landQueue";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { steps } = vi.hoisted(() => ({ steps: new Array<string>() }));

vi.mock(import("#src/services/shared/spawnGit"), () => ({
  spawnGit: (args: string[]) => {
    steps.push(takeOne(args, 0));
    return { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
  },
}));
vi.mock(import("#src/services/shared/runGit"), () => ({ runGit: () => "1" }));
vi.mock(import("#src/services/land/verifyLanded"), () => ({ verifyLanded: () => true }));
vi.mock(import("#src/services/precheck/runPrecheck"), () => ({
  runPrecheck: () => {
    steps.push("precheck");
    return Promise.resolve({ findings: [], regenerated: [] });
  },
}));

describe(landQueue, () => {
  // The precheck reads the tree the push sends, so it runs after the pull has replayed the commits onto the queue
  test("runs the precheck on the tree the pull produced, before the push", async () => {
    expect.hasAssertions();

    await expect(landQueue(false, false)).resolves.toBe(LANDING_EXIT_STATUS.landed);
    expect(steps).toStrictEqual(["pull", "precheck", "push"]);
  });
});
