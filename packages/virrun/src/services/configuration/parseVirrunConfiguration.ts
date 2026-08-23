import type { VirrunConfiguration } from "#src/models/virrun/VirrunConfiguration";

import { virrunConfigurationSchema } from "#src/models/virrun/VirrunConfiguration";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
// Validates the loaded config module/JSON object (deserialization is unconfig's job). Throws (not getResult) because
// A malformed committed config is a developer error to surface at the call site, not a recoverable runtime condition.
// Rebuilt so the editor-only `$schema` pointer (the JSON variant's) never leaks into the runtime config; the
// `environment` key is only carried when a preset is set, so no `undefined` value is ever synthesized (absence is
// The missing key).
export const parseVirrunConfiguration = (value: unknown): VirrunConfiguration =>
  getResult(() => virrunConfigurationSchema.parse(value)).match(
    ({ backend, environment }) => (environment ? { backend, environment } : { backend }),
    (error) => {
      throw new InvalidOperationError(Operation.Read, parseVirrunConfiguration.name, error.message);
    },
  );
