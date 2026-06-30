import type { BackendType } from "@/models/virrun/BackendType";

import { VIRRUN_SCHEMA_RELATIVE_PATH } from "@/services/exec/util/constants";
// Renders the `virrun.config.json` text that `virrun init` writes: the `$schema` pointer (so editors surface the
// Shipped schema.json's field docs/enums on hover, the oxlint pattern) and the chosen backend. Two-space indent
// And a trailing newline mirror the committed root config so a generated file diffs cleanly against a hand edit.
export const buildVirrunConfigurationContent = (backend: BackendType): string =>
  `${JSON.stringify({ $schema: VIRRUN_SCHEMA_RELATIVE_PATH, backend }, null, 2)}\n`;
