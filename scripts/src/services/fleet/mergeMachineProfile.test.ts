import { mergeMachineProfile } from "#src/services/fleet/mergeMachineProfile";
import { describe, expect, test } from "vitest";

describe(mergeMachineProfile, () => {
  test("names a new profile by the hostname, lent every area", () => {
    expect.hasAssertions();

    expect(mergeMachineProfile(undefined, ["windows"], "pc")).toStrictEqual({
      areas: ["*"],
      capabilities: ["windows"],
      id: "pc",
    });
  });

  test("keeps the id and areas the user set, and keeps a capability the user added", () => {
    expect.hasAssertions();

    expect(
      mergeMachineProfile(
        { areas: ["genshin"], capabilities: ["macos", "parity-page"], id: "macbook" },
        ["macos"],
        "mac",
      ),
    ).toStrictEqual({ areas: ["genshin"], capabilities: ["macos", "parity-page"], id: "macbook" });
  });

  test("drops a detected capability the machine no longer reads", () => {
    expect.hasAssertions();

    expect(mergeMachineProfile({ areas: ["*"], capabilities: ["game-install"], id: "pc" }, [], "pc")).toStrictEqual({
      areas: ["*"],
      capabilities: [],
      id: "pc",
    });
  });
});
