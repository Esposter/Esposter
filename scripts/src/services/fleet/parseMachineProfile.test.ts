import { parseMachineProfile } from "#src/services/fleet/parseMachineProfile";
import { describe, expect, test } from "vitest";

describe(parseMachineProfile, () => {
  const PROFILE = { areas: ["genshin"], capabilities: ["windows"], id: "macbook" };

  test("reads a complete profile", () => {
    expect.hasAssertions();

    expect(parseMachineProfile(JSON.stringify(PROFILE))).toStrictEqual(PROFILE);
  });

  test("reads a profile missing its areas, or a file that is not JSON, as none", () => {
    expect.hasAssertions();

    expect(parseMachineProfile(JSON.stringify({ capabilities: [], id: "pc" }))).toBeUndefined();
    expect(parseMachineProfile("{")).toBeUndefined();
  });
});
