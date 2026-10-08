import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";

import { toLeyLineRegions } from "#src/services/genshinAssets/leyLine/toLeyLineRegions";
import { OutcropKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toLeyLineRegions, () => {
  const FIRST_CITY_ID = 1;
  const SECOND_CITY_ID = 3;
  const FIRST_SECTION_ID = 10;
  const LATER_SECTION_ID = 12;
  const EMPTY_SECTION_ID = 13;
  const UNORDERED_SECTION_ID = 11;
  const PLAYER_LEVEL_CONDITION = "BLOSSOM_REFRESH_COND_PLAYER_LEVEL_EQUAL_GREATER";
  const AREA_UNLOCK_CONDITION = "BLOSSOM_REFRESH_COND_UNLOCK_ANY_AREA_IN_CITY";
  const refreshRows: ExcelBlossomRefreshRow[] = [
    {
      cityId: FIRST_CITY_ID,
      HGBNAGMEAFI: [{ param: [8], type: PLAYER_LEVEL_CONDITION }],
      refreshType: "BLOSSOM_REFRESH_EXP",
    },
    {
      cityId: FIRST_CITY_ID,
      HGBNAGMEAFI: [{ param: [2], type: PLAYER_LEVEL_CONDITION }],
      refreshType: "BLOSSOM_REFRESH_CRYSTAL",
    },
    {
      cityId: SECOND_CITY_ID,
      HGBNAGMEAFI: [
        { param: [18], type: PLAYER_LEVEL_CONDITION },
        { param: [SECOND_CITY_ID], type: AREA_UNLOCK_CONDITION },
      ],
      refreshType: "BLOSSOM_REFRESH_SCOIN",
    },
  ];
  const groupRows: ExcelBlossomGroupRow[] = [
    { cityId: FIRST_CITY_ID, id: 2, nextCampIdVec: [], sectionId: FIRST_SECTION_ID },
    { cityId: FIRST_CITY_ID, id: 1, nextCampIdVec: [2], sectionId: FIRST_SECTION_ID },
    { cityId: FIRST_CITY_ID, id: 3, nextCampIdVec: [], sectionId: LATER_SECTION_ID },
    { cityId: FIRST_CITY_ID, id: 5, nextCampIdVec: [], sectionId: UNORDERED_SECTION_ID },
    { cityId: SECOND_CITY_ID, id: 4, nextCampIdVec: [], sectionId: UNORDERED_SECTION_ID },
  ];
  const sectionOrderRows: ExcelBlossomSectionOrderRow[] = [
    { cityId: FIRST_CITY_ID, order: 3, sectionId: EMPTY_SECTION_ID },
    { cityId: FIRST_CITY_ID, order: 2, sectionId: LATER_SECTION_ID },
    { cityId: FIRST_CITY_ID, order: 1, sectionId: FIRST_SECTION_ID },
  ];

  test("each city with a ley line kind gets its kinds' rules, its places by id, and its listed sections in the game's order", () => {
    expect.hasAssertions();

    expect(toLeyLineRegions(refreshRows, groupRows, sectionOrderRows)).toStrictEqual(
      new Map([
        [
          FIRST_CITY_ID,
          {
            kinds: [{ kind: OutcropKind.Revelation, playerLevel: 8, unlockCityIds: [] }],
            places: [
              { id: 1, nextIds: [2], sectionId: FIRST_SECTION_ID },
              { id: 2, nextIds: [], sectionId: FIRST_SECTION_ID },
              { id: 3, nextIds: [], sectionId: LATER_SECTION_ID },
              { id: 5, nextIds: [], sectionId: UNORDERED_SECTION_ID },
            ],
            sectionIds: [FIRST_SECTION_ID, LATER_SECTION_ID],
          },
        ],
        [
          SECOND_CITY_ID,
          {
            kinds: [{ kind: OutcropKind.Wealth, playerLevel: 18, unlockCityIds: [SECOND_CITY_ID] }],
            places: [{ id: 4, nextIds: [], sectionId: UNORDERED_SECTION_ID }],
            sectionIds: [],
          },
        ],
      ]),
    );
  });
});
