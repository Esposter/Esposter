import type { BackendType } from "@/models/virrun/BackendType";

import { VIRRUN_SCHEMA_RELATIVE_PATH } from "@/services/exec/util/constants";
// The `$schema` pointer makes editors surface the shipped schema.json's field docs/enums on hover; the trailing
// Newline mirrors the committed root config so a generated file diffs cleanly against a hand edit.
export const buildVirrunConfigurationContent = (backend: BackendType): string =>
  `${JSON.stringify({ $schema: VIRRUN_SCHEMA_RELATIVE_PATH, backend }, null, 2)}\n`;
