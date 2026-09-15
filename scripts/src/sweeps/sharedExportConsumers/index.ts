import { readSharedExportFindings } from "#src/services/sweeps/sharedExportConsumers/readSharedExportFindings";

// Prints rather than exits non-zero: the pass reads the list, and `src/workspace/sharedExportConsumers.test.ts`
// Is what fails on it. Each line says what the pass does with the export: move it beside its one consumer, or
// Delete it (`.agents/ledgers/file-organization/`).
for (const { consumerPackagePath, name, path } of readSharedExportFindings())
  console.info(`${consumerPackagePath === undefined ? "dead" : `move to ${consumerPackagePath}`}  ${path} -> ${name}`);
