import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { TrialReliquaryPiece } from "#src/models/genshinAssets/trials/TrialReliquaryPiece";

import { toTrialReliquary } from "#src/services/genshinAssets/trials/toTrialReliquary";
import { ArtifactSlot, Attribute } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toTrialReliquary, () => {
  const RELIQUARY_ID = 91;
  const SET_RELIQUARY_ID = 60_211;
  const SET_ID = 15_021;
  const MAIN_PROP_ID = 15_004;
  const AFFIX_ID = 201_053;
  const SECOND_AFFIX_ID = 201_054;

  const pieceMap = new Map<number, TrialReliquaryPiece>([
    [SET_RELIQUARY_ID, { rarity: 5, setId: SET_ID, slot: ArtifactSlot.FlowerOfLife }],
  ]);
  const mainPropTypeMap = new Map<number, string>([[MAIN_PROP_ID, Attribute.AttackPercent]]);
  const affixMap = new Map<number, ExcelReliquaryAffixRow>([
    [AFFIX_ID, { depotId: 201, groupId: 5, id: AFFIX_ID, propType: Attribute.Attack, propValue: 4.67 }],
    [SECOND_AFFIX_ID, { depotId: 201, groupId: 5, id: SECOND_AFFIX_ID, propType: Attribute.Attack, propValue: 5.25 }],
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
