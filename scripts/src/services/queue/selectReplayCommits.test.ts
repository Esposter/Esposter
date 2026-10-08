import { selectReplayCommits } from "#src/services/queue/selectReplayCommits";
import { describe, expect, test } from "vitest";

describe(selectReplayCommits, () => {
  const EPOCH = new Date(0).toISOString();
  const LATER = new Date(1000).toISOString();

  test("skips a local commit the remote carries as the collector's port, keeping the rest in order", () => {
    expect.hasAssertions();

    const kept = { authorDate: LATER, sha: "b", subject: "b" };

    expect(
      selectReplayCommits(
        [{ authorDate: EPOCH, sha: "a", subject: "a" }, kept],
        [{ authorDate: EPOCH, sha: "9", subject: "a" }],
      ),
    ).toStrictEqual([kept]);
  });

  test("keeps a commit whose subject the remote carries when its author date differs", () => {
    expect.hasAssertions();

    const local = { authorDate: LATER, sha: "c", subject: "chore: format" };

    expect(selectReplayCommits([local], [{ authorDate: EPOCH, sha: "9", subject: "chore: format" }])).toStrictEqual([
      local,
    ]);
  });

  test("replays every commit when the remote carries none of them", () => {
    expect.hasAssertions();

    const localCommits = [
      { authorDate: EPOCH, sha: "a", subject: "a" },
      { authorDate: LATER, sha: "b", subject: "b" },
    ];

    expect(selectReplayCommits(localCommits, [])).toStrictEqual(localCommits);
  });
});
