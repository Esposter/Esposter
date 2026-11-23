import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { defineRule } from "@oxlint/plugins";

// The re-exports (`export ... from`) of a module in runs: consecutive re-exports make up one run, and every other
// Top-level statement, a named export without a source included, ends it, so no re-export is sorted past one. Within a
// Run the re-exports sort by source path, as the barrel generator writes them, which gives up the order their modules
// Evaluate in: a module with a top-level effect loads in its sorted position. Each run is sorted and reported on its own
const sortExports: Rule = defineRule({
  create(context) {
    return {
      Program(program) {
        const runs: SortingItem[][] = [];
        let run: SortingItem[] = [];
        for (const statement of program.body) {
          const source =
            statement.type === "ExportAllDeclaration" || statement.type === "ExportNamedDeclaration"
              ? statement.source
              : undefined;
          if (!source) {
            runs.push(run);
            run = [];
            continue;
          }
          run.push({ name: source.value, node: statement });
        }
        runs.push(run);
        for (const reExportRun of runs) reportUnsorted(context, reExportRun);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortExports;
