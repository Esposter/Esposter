import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { getCollectorItems } from "#src/services/resume/getCollectorItems";
import { describe, expect, test } from "vitest";

describe(getCollectorItems, () => {
  const RED = "the review-queue skill's red path";

  test.each([
    ["nothing", [], [], undefined, { conclusion: "success", status: "completed" }, []],
    ["owed commits", ["a", "b"], [], undefined, undefined, [["", "2 commits owed to develop"]]],
    ["a held commit", [], ["a"], undefined, undefined, [[RED, "1 held commits"]]],
    ["a failed run", [], [], undefined, { conclusion: "failure", status: "completed" }, [[RED, "latest run failure"]]],
    ["a running run", [], [], undefined, { conclusion: "", status: "in_progress" }, [["", "latest run in_progress"]]],
    [
      "a gate",
      [],
      [],
      { kind: GateDecisionKind.Running, reason: "waiting" },
      undefined,
      [["", "release gate Running: waiting"]],
    ],
  ])("reads %s", (_title, owedShas, heldShas, gate, run, items) => {
    expect.hasAssertions();

    expect(
      getCollectorItems({ gate, heldShas, owedShas }, run).map(({ action, text }) => [action, text]),
    ).toStrictEqual(items);
  });
});
