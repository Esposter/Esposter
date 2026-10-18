import { readGcsimTalentArrays } from "#src/services/genshinAssets/kits/gcsim/readGcsimTalentArrays";
import { describe, expect, test } from "vitest";

describe("readGcsimTalentArrays", () => {
  test("reads a flat array as one row, a list of rows as one row each and a nested list by its innermost groups", () => {
    expect.hasAssertions();

    const source = [
      "package varesa",
      "",
      "var (",
      "\tattack = [][]float64{",
      "\t\t{ // attack: ByTheHorns - 1-Hit DMG: {0}",
      "\t\t\t0.5,",
      "\t\t\t1.0,",
      "\t\t},",
      "\t\t{ // attack: ByTheHorns - 2-Hit DMG: {1}",
      "\t\t\t0.25,",
      "\t\t\t0.5,",
      "\t\t},",
      "\t}",
      "\t// attack: ByTheHorns - Charged Attack DMG: {3}",
      "\tcharged = []float64{",
      "\t\t0.75,",
      "\t\t1.5,",
      "\t}",
      "\tnested = [][][]float64{",
      "\t\t{{ // attack: KamisatoArtKabuki - 4-Hit DMG: {3}×3",
      "\t\t\t1,",
      "\t\t}},",
      "\t}",
      ")",
    ].join("\n");

    expect(readGcsimTalentArrays(source)).toStrictEqual(
      new Map([
        [
          "attack",
          {
            line: 4,
            rows: [
              [0.5, 1],
              [0.25, 0.5],
            ],
          },
        ],
        ["charged", { line: 15, rows: [[0.75, 1.5]] }],
        ["nested", { line: 19, rows: [[1]] }],
      ]),
    );
  });
});
