import { chooseDetailWavelength } from "#src/services/genshinParity/passes/chooseDetailWavelength";
import { describe, expect, test } from "vitest";

describe(chooseDetailWavelength, () => {
  test("a family's wavelength is its frame's lobe where the frame resolves one", () => {
    expect.hasAssertions();

    expect(chooseDetailWavelength({ frame: 2.5648, texture: 1.1 })).toStrictEqual({
      isFromTexture: false,
      metres: 2.5648,
    });
  });

  test("a family whose frame resolves no lobe takes its normal map's wavelength", () => {
    expect.hasAssertions();

    expect(chooseDetailWavelength({ texture: 1.1 })).toStrictEqual({ isFromTexture: true, metres: 1.1 });
  });

  test("a family neither its frame nor its normal map resolves has no wavelength", () => {
    expect.hasAssertions();

    expect(chooseDetailWavelength({})).toBeUndefined();
  });
});
