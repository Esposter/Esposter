import { claimWitnessRenderers } from "#parity/witness/claimWitnessRenderers";
import { describe, expect, test } from "vitest";

describe(claimWitnessRenderers, () => {
  test("claims each renderer once, a drawing claim before a not-drawn one, and none where nothing names it", () => {
    expect.hasAssertions();

    const claims = claimWitnessRenderers(
      [
        { materials: ["a"], mesh: "a" },
        { materials: ["a"], mesh: "a" },
        { materials: ["a"], mesh: "b" },
        { materials: ["b"], mesh: "b" },
        { materials: ["a"], mesh: "c" },
      ],
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
