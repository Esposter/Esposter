import { assertEditorScriptsWithinBudget } from "#src/services/dependencies/score/assertEditorScriptsWithinBudget";
import { EDITOR_MODULES } from "#src/services/dependencies/score/constants";
import { getEditorScriptBytes } from "#src/services/dependencies/score/getEditorScriptBytes";
import { readClientBundleReport } from "#src/services/dependencies/score/readClientBundleReport";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Needs a production build and the analyze report written beside it, so it is a build-gated check rather than a unit
// Test: it throws when either is absent, and exits non-zero when an editor's script is over the budget
await runCommand(
  defineCommand({
    meta: {
      description:
        "Hold each editor's gzipped script beyond the explorer's to the budget, read from the production build and its client bundle report",
      name: "budget:editors",
    },
    run: () => {
      const { report } = readClientBundleReport();
      assertEditorScriptsWithinBudget(
        Object.fromEntries(
          EDITOR_MODULES.map((editorModule) => [editorModule, getEditorScriptBytes(report, editorModule)]),
        ),
      );
    },
  }),
);
