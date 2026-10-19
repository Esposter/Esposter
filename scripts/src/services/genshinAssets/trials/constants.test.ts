import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";

import { Attribute } from "genshin-world";
import { describe } from "vitest";

// The reliquary, main property and affix ids the trial suites share, and the two affix rows they name
export const SET_RELIQUARY_ID = 60_211;
export const SET_ID = 15_021;
export const MAIN_PROP_ID = 15_004;
export const AFFIX_ID = 201_053;
export const SECOND_AFFIX_ID = 201_054;
export const AFFIX_ROW: ExcelReliquaryAffixRow = {
  depotId: 201,
  groupId: 5,
  id: AFFIX_ID,
  propType: Attribute.Attack,
  propValue: 4.67,
};
export const SECOND_AFFIX_ROW: ExcelReliquaryAffixRow = {
  depotId: 201,
  groupId: 5,
  id: SECOND_AFFIX_ID,
  propType: Attribute.Attack,
  propValue: 5.25,
};

describe.todo("constants");
