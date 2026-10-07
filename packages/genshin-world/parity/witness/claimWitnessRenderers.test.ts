import type { ScenePlacement } from "genshin-engine";

import { claimWitnessRenderers } from "#parity/witness/claimWitnessRenderers";
import { describe, expect, test } from "vitest";

const createPlacement = (mesh: string, material: string): ScenePlacement => ({
  materials: [material],
  mesh,
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

describe(claimWitnessRenderers, () => {
  test("claims each renderer once, a drawing claim before a not-drawn one, and none where nothing names it", () => {
    expect.hasAssertions();

    const claims = claimWitnessRenderers(
      {
        materials: {},
        placements: [
          createPlacement("a", "a"),
          createPlacement("a", "a"),
          createPlacement("b", "a"),
          createPlacement("b", "b"),
          createPlacement("c", "a"),
        ],
      },
      {
        witnessFamilies: { family: /^a /u },
        witnessStandIns: { standIn: /^b a$/u },
        witnessUndrawn: { undrawn: /^[ab] /u },
      },
    );

    expect(claims).toStrictEqual([
      { claim: "family", isDrawn: true, renderer: "a a" },
      { claim: "standIn", isDrawn: true, renderer: "b a" },
      { claim: "undrawn", isDrawn: false, renderer: "b b" },
      { claim: "", isDrawn: false, renderer: "c a" },
    ]);
  });
});
