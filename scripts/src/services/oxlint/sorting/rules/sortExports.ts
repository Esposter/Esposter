import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { ESTree, Rule } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { splitRuns } from "#src/services/oxlint/sorting/splitRuns";
import { defineRule } from "@oxlint/plugins";

// The source a statement re-exports from, when it is a re-export
const getReExportSource = (statement: ESTree.Program["body"][number]) =>
  statement.type === "ExportAllDeclaration" || statement.type === "ExportNamedDeclaration"
    ? statement.source
    : undefined;

// The re-exports (`export ... from`) of a module in runs: consecutive re-exports make up one run, and every other
// Top-level statement, a named export without a source included, ends it, so no re-export is sorted past one. Within a
// Run the re-exports sort by source path, as the barrel generator writes them, which gives up the order their modules
// Evaluate in: a module with a top-level effect loads in its sorted position. Each run is sorted and reported on its
// Own
const sortExports: Rule = defineRule({
  create(context) {
    return {
      Program(program) {
        for (const run of splitRuns(program.body, (statement) => !getReExportSource(statement)))
          reportUnsorted(
            context,
            run.flatMap((statement): SortingItem[] => {
              const source = getReExportSource(statement);
              return source ? [{ name: source.value, node: statement }] : [];
            }),
          );
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortExports;
