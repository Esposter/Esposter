import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { FRAME_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { getPoseBar } from "#src/services/genshinParity/witness/getPoseBar";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), () => ({
  ParityReferenceMap: {
    "global-bar": { screen: "WorldScreen", wikiTitle: "File:Global.png" },
    "own-bar": { poseBar: 7.5, screen: "WorldScreen", wikiTitle: "File:Own.png" },
  } satisfies Record<string, ParityReference>,
}));

describe(getPoseBar, () => {
  test("holds a reference to its own bar where it sets one", () => {
    expect.hasAssertions();

    expect(getPoseBar("own-bar")).toBe(7.5);
  });

  test("holds a reference without one to the camera pass's gate", () => {
    expect.hasAssertions();

    expect(getPoseBar("global-bar")).toBe(FRAME_GATE_PIXELS);
  });

  test("holds a reference the map does not name to the camera pass's gate", () => {
    expect.hasAssertions();

    expect(getPoseBar("unnamed")).toBe(FRAME_GATE_PIXELS);
  });
});
