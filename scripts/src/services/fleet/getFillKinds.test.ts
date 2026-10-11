import { FillKind } from "#src/models/fleet/FillKind";
import { getFillKinds } from "#src/services/fleet/getFillKinds";
import { describe, expect, test } from "vitest";

describe(getFillKinds, () => {
  test.each([
    ["cpu", [FillKind.Unit], [FillKind.Cpu]],
    ["", [FillKind.Unit], [FillKind.Unit]],
    ["", undefined, [FillKind.Unit, FillKind.Cpu, FillKind.Page]],
  ])("kinds of %j with a profile of %j are %j", (value, profileKinds, kinds) => {
    expect.hasAssertions();

    expect(getFillKinds(value, profileKinds)).toStrictEqual(kinds);
  });
});
