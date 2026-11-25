import { readSharedExportFindings } from "#src/services/sweeps/sharedExportConsumers/readSharedExportFindings";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints rather than exits non-zero: the pass reads the list, and `src/workspace/packages/sharedExportConsumers.test.ts`
// Is what fails on it. Each line says what the pass does with the export: move it beside its one consumer, or
// Delete it (`.agents/ledgers/file-organization/`).
await runCommand(
  defineCommand({
    meta: {
      description:
        "Print each shared export that one package alone names, to move beside it, or that nothing names, to delete",
      name: "ai:sweep:shared-export-consumers",
    },
    run: () => {
      for (const { consumerPackagePath, name, path } of readSharedExportFindings())
        console.info(
          `${consumerPackagePath === undefined ? "dead" : `move to ${consumerPackagePath}`}  ${path} -> ${name}`,
        );
    },
  }),
);
