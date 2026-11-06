import { parseScriptQuestIds } from "#src/services/genshinProgress/parseScriptQuestIds";
import { describe, expect, test } from "vitest";

describe(parseScriptQuestIds, () => {
  test("reads the quest ids a script's quest lines name, once each, and skips a commented line", () => {
    expect.hasAssertions();

    expect(
      parseScriptQuestIds(
        [
          "export const session: ScriptedStep[] = [",
          '  "quest 351",',
          '  { equals: "finished", kind: ScriptedStepKind.Expect, line: "quest 351" },',
          '  "quest 352",',
          '  "bag 1",',
          '  // "quest 999",',
          "];",
        ].join("\n"),
      ),
    ).toStrictEqual(["351", "352"]);
  });
});
