import { fillDumpDefaults } from "#src/services/genshinText/fillDumpDefaults";
import { describe, expect, test } from "vitest";

describe(fillDumpDefaults, () => {
  test("restores a number, a flag and a list another row holds at their defaults", () => {
    expect.hasAssertions();

    const rows: unknown[] = [{ count: 3, id: 1, isOpen: true, itemIds: [4] }, { id: 2 }];
    fillDumpDefaults(rows);

    expect(rows).toStrictEqual([
      { count: 3, id: 1, isOpen: true, itemIds: [4] },
      { count: 0, id: 2, isOpen: false, itemIds: [] },
    ]);
  });

  test("restores an unset message and the fields of the rows of a list", () => {
    expect.hasAssertions();

    const rows: unknown[] = [
      { consumeItem: { count: 2, itemId: 5 }, rewards: [{ count: 1, id: 6 }, {}] },
      { rewards: [] },
    ];
    fillDumpDefaults(rows);

    expect(rows).toStrictEqual([
      {
        consumeItem: { count: 2, itemId: 5 },
        rewards: [
          { count: 1, id: 6 },
          { count: 0, id: 0 },
        ],
      },
      { consumeItem: { count: 0, itemId: 0 }, rewards: [] },
    ]);
  });

  test("leaves a string out, since an enum's default is a name no other row holds", () => {
    expect.hasAssertions();

    const rows: unknown[] = [{ id: 1, type: "QUEST_TYPE_WQ" }, { id: 2 }];
    fillDumpDefaults(rows);

    expect(rows).toStrictEqual([{ id: 1, type: "QUEST_TYPE_WQ" }, { id: 2 }]);
  });
});
