import { readOpeningParentQuestIds } from "#src/services/genshinText/readOpeningParentQuestIds";
import { describe, expect, test } from "vitest";

describe(readOpeningParentQuestIds, () => {
  // Made-up titles, each the one quest it names; the opening's own world quest is 100
  const titleQuestIds = new Map([
    ["Made Up Quest", [200]],
    ["Made Up Chapter", [300]],
    ["Own Quest", [100]],
    ["Shared Title", [400, 500]],
  ]);

  test("reads the quest each wiki title names, once, and no quest of the opening's own", () => {
    expect.hasAssertions();

    expect(
      readOpeningParentQuestIds(["Made Up Quest", "Made Up Chapter", "Made Up Quest", "Own Quest"], 100, titleQuestIds),
    ).toStrictEqual([200, 300]);
  });

  test("refuses a title that names no single quest, so a drifted title cannot leave a gate unlinked", () => {
    expect.hasAssertions();

    expect(() => readOpeningParentQuestIds(["Missing Title"], 100, titleQuestIds)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Missing Title, names no single quest or chapter in the dump]`,
    );
    expect(() => readOpeningParentQuestIds(["Shared Title"], 100, titleQuestIds)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Shared Title, names no single quest or chapter in the dump]`,
    );
  });
});
