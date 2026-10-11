import { FillKind } from "#src/models/fleet/FillKind";
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

  test("reads a profile's fill target and fill kinds, in the order they are written", () => {
    expect.hasAssertions();

    const fillProfile = { ...PROFILE, fillKinds: [FillKind.Unit, FillKind.Cpu], fillTarget: 0 };

    expect(parseMachineProfile(JSON.stringify(fillProfile))).toStrictEqual(fillProfile);
  });

  test("reads a profile whose fill target is not a whole count, or whose fill kind is unknown, as none", () => {
    expect.hasAssertions();

    expect(parseMachineProfile(JSON.stringify({ ...PROFILE, fillTarget: 0.1 }))).toBeUndefined();
    expect(parseMachineProfile(JSON.stringify({ ...PROFILE, fillTarget: -1 }))).toBeUndefined();
    expect(parseMachineProfile(JSON.stringify({ ...PROFILE, fillKinds: ["gpu"] }))).toBeUndefined();
    expect(parseMachineProfile(JSON.stringify({ ...PROFILE, fillKinds: "unit" }))).toBeUndefined();
  });
});
