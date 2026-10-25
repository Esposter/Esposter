import { EDITOR_SCRIPT_BUDGET } from "@esposter/configuration";
import { EDITOR_MODULES } from "#src/services/dependencies/score/constants";
import { getEditorScriptBytes } from "#src/services/dependencies/score/getEditorScriptBytes";
import { readClientBundleReport } from "#src/services/dependencies/score/readClientBundleReport";
import { describe, expect, test } from "vitest";

describe(getEditorScriptBytes, () => {
  test("An editor's script loads within the budget", () => {
    expect.hasAssertions();

    // Throws when the analyze report or the production build is absent, so a missing build fails this test rather than
    // Passing it over
    const { report } = readClientBundleReport();
    for (const editorModule of EDITOR_MODULES)
      expect(getEditorScriptBytes(report, editorModule)).toBeLessThanOrEqual(EDITOR_SCRIPT_BUDGET);
  });
});
