import type { CiRun } from "#src/models/ci/CiRun";

import { selectRunToWatch } from "#src/services/ci/selectRunToWatch";
import { describe, expect, test } from "vitest";

// A run created the given minutes after the epoch, in the ISO form `gh` writes
const createRun = (databaseId: number, minutes: number, conclusion = "", workflowName = "CI"): CiRun => ({
  conclusion,
  createdAt: Temporal.Instant.fromEpochMilliseconds(0).add({ minutes }).toString(),
  databaseId,
  headSha: String(databaseId),
  status: conclusion ? "completed" : "in_progress",
  workflowName,
});

describe(selectRunToWatch, () => {
  test("the commit's own run is watched while it has not been superseded", () => {
    expect.hasAssertions();

    const commitRun = createRun(1, 60);

    expect(selectRunToWatch(commitRun, [createRun(2, 65)])).toBe(commitRun);
  });

  test("a skipped commit run gives way to the newest later run of its workflow", () => {
    expect.hasAssertions();

    const newest = createRun(4, 69);

    expect(
      selectRunToWatch(createRun(1, 60, "skipped"), [
        createRun(0, 0),
        createRun(2, 65, "cancelled"),
        createRun(3, 67, "", "Bench"),
        newest,
      ]),
    ).toBe(newest);
  });

  test("nothing is watched before the commit has a run", () => {
    expect.hasAssertions();

    expect(selectRunToWatch(undefined, [createRun(2, 65)])).toBeUndefined();
  });
});
