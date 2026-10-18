import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";

import { BLESSING_ARTIFACT_SET_NAMES } from "#src/services/genshinAssets/domains/treeRewardCounts";
import { resolveBlessingArtifactSetIds } from "#src/services/genshinAssets/domains/resolveBlessingArtifactSetIds";
import { describe, expect, test } from "vitest";

const NAME_HASH_OFFSET = 3000;
const SET_ID_OFFSET = 10_000;
const EQUIP_AFFIX_ID_OFFSET = 200_000;
// One set for each distinct name the wiki gives, named by its own equip affix, so every domain's four names resolve
const NAMES = [...new Set(Object.values(BLESSING_ARTIFACT_SET_NAMES).flat())];
const equipAffixes: ExcelEquipAffixRow[] = NAMES.map((_, index) => ({
  id: EQUIP_AFFIX_ID_OFFSET + index,
  nameTextMapHash: NAME_HASH_OFFSET + index,
}));
const reliquarySets: ExcelReliquarySetRow[] = NAMES.map((_, index) => ({
  containsList: [],
  equipAffixId: EQUIP_AFFIX_ID_OFFSET + index,
  setId: SET_ID_OFFSET + index,
  setNeedNum: [2, 4],
}));
const textMap = new Map(NAMES.map((name, index) => [String(NAME_HASH_OFFSET + index), name]));

describe(resolveBlessingArtifactSetIds, () => {
  test("each Blessing domain's four names resolve to four sets", () => {
    expect.hasAssertions();

    const resolved = resolveBlessingArtifactSetIds(BLESSING_ARTIFACT_SET_NAMES, reliquarySets, equipAffixes, textMap);
    expect(Object.keys(resolved)).toStrictEqual(Object.keys(BLESSING_ARTIFACT_SET_NAMES));
    expect(Object.values(resolved).map((setIds) => new Set(setIds).size)).toStrictEqual(
      Object.keys(BLESSING_ARTIFACT_SET_NAMES).map(() => 4),
    );
  });

  test("a name resolves to the set its equip affix's text names", () => {
    expect.hasAssertions();

    expect(resolveBlessingArtifactSetIds({ 1: [NAMES[1]] }, reliquarySets, equipAffixes, textMap)).toStrictEqual({
      1: [SET_ID_OFFSET + 1],
    });
  });

  test("a name no set answers to is refused", () => {
    expect.hasAssertions();

    expect(() =>
      resolveBlessingArtifactSetIds({ 1: ["Unknown Set"] }, reliquarySets, equipAffixes, textMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: reliquary sets, names 0 sets as Unknown Set]`,
    );
  });
});
