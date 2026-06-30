import { REAPPLY_POSTINSTALL_COMMAND } from "@/services/exec/snapshot/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { withReappliedPostinstall } from "@/services/virrun/withReappliedPostinstall";
import { describe, expect, test } from "vitest";
// An opaque token standing in for the sandboxed command the postinstall replay runs ahead of.
const ARGV_COMMAND = [TEST_FILENAME];
const STRING_COMMAND = TEST_FILENAME;

describe(withReappliedPostinstall, () => {
  test("replays postinstall ahead of an argv command and hands the argv through verbatim", () => {
    expect.hasAssertions();

    // `exec "$@"` runs the original argv as positional params, so no token is ever re-quoted; `&&` aborts the run
    // With the replay's exit code if regeneration fails.
    expect(withReappliedPostinstall(ARGV_COMMAND)).toStrictEqual([
      "/bin/sh",
      "-c",
      `${REAPPLY_POSTINSTALL_COMMAND} && exec "$@"`,
      "sh",
      ...ARGV_COMMAND,
    ]);
  });

  test("chains the replay before a string command with &&", () => {
    expect.hasAssertions();

    expect(withReappliedPostinstall(STRING_COMMAND)).toBe(`${REAPPLY_POSTINSTALL_COMMAND} && ${STRING_COMMAND}`);
  });
});
