import { assertEditorScriptsWithinBudget } from "#src/services/dependencies/score/assertEditorScriptsWithinBudget";
import { EDITOR_SCRIPT_BUDGET } from "@esposter/configuration";
import { describe, expect, test } from "vitest";

describe(assertEditorScriptsWithinBudget, () => {
  test("a cutover build over the budget does not merge", () => {
    expect.hasAssertions();

    expect(() => {
      assertEditorScriptsWithinBudget({ "components/Resource/Webpage/Editor.vue": EDITOR_SCRIPT_BUDGET + 1 });
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: components/Resource/Webpage/Editor.vue, its script is 204801 bytes gzipped, over the 204800 byte budget]`,
    );
  });
});
