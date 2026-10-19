import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";

import {
  AFFIX_ID,
  AFFIX_ROW,
  SECOND_AFFIX_ID,
  SECOND_AFFIX_ROW,
  SET_ID,
  SET_RELIQUARY_ID,
} from "#src/services/genshinAssets/trials/constants.test";
import { toTrialReliquary } from "#src/services/genshinAssets/trials/toTrialReliquary";
import { ArtifactSlot, Attribute } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toTrialReliquary, () => {
  const RELIQUARY_ID = 91;
  const MAIN_PROP_ID = 15_004;

  const pieceMap = new Map<number, TrialReliquaryPiece>([
    [SET_RELIQUARY_ID, { rarity: 5, setId: SET_ID, slot: ArtifactSlot.FlowerOfLife }],
  ]);
  const mainPropTypeMap = new Map<number, string>([[MAIN_PROP_ID, Attribute.AttackPercent]]);
  const affixMap = new Map<number, ExcelReliquaryAffixRow>([
    [AFFIX_ID, AFFIX_ROW],
    [SECOND_AFFIX_ID, SECOND_AFFIX_ROW],
  ]);

  test("a sub-stat a trial reliquary rolled more than once is one line at its rolls' sum", () => {
    expect.hasAssertions();

    const reliquary = toTrialReliquary(
      {
        AppendPropList: [AFFIX_ID, SECOND_AFFIX_ID, AFFIX_ID],
        Id: RELIQUARY_ID,
        Level: 5,
        MainPropId: MAIN_PROP_ID,
        ReliquaryId: SET_RELIQUARY_ID,
      },
      pieceMap,
      mainPropTypeMap,
      affixMap,
    );

    expect(reliquary.minorAffixes).toStrictEqual([{ attribute: Attribute.Attack, value: 4.67 + 5.25 + 4.67 }]);
  });
});
