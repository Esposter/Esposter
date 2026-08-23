import type { BackendType } from "#src/models/virrun/BackendType";
import type { Environment } from "#src/models/virrun/Environment";

import { VIRRUN_SCHEMA_RELATIVE_PATH } from "#src/services/exec/util/constants";
// The `$schema` pointer makes editors surface the shipped schema.json's field docs/enums on hover; the trailing
// Newline mirrors the committed root config so a generated file diffs cleanly against a hand edit. An absent
// Environment is omitted entirely rather than written as a `none` value — the config's "no preset" state is the
// Missing key, matching the optional schema.
export const buildVirrunConfigurationContent = (backend: BackendType, environment?: Environment): string =>
  `${JSON.stringify({ $schema: VIRRUN_SCHEMA_RELATIVE_PATH, backend, ...(environment && { environment }) }, null, 2)}\n`;
