import { parsePeers } from "#src/services/fleet/data/parsePeers";
import { describe, expect, test } from "vitest";

const PEER = {
  host: "192.168.0.2",
  identityFile: "~/.ssh/fleet",
  parityDirectory: "~/data",
  repository: "/repo",
  user: "me",
};

describe(parsePeers, () => {
  test("reads each named peer's fields", () => {
    expect.hasAssertions();

    expect(parsePeers(JSON.stringify({ laptop: PEER }))).toStrictEqual({ laptop: PEER });
  });

  test("rejects a field that is not a string", () => {
    expect.hasAssertions();

    expect(() => parsePeers(JSON.stringify({ laptop: { ...PEER, host: 1 } }))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: laptop, its host is not a string]`,
    );
  });
});
