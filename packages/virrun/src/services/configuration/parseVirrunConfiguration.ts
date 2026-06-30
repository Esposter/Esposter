import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { virrunConfigurationSchema } from "@/models/virrun/VirrunConfiguration";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
// Throws (not getResult) because a malformed committed config is a developer error to surface at the call site, not
// A recoverable runtime condition. Rebuilt from `backend` alone so the editor-only `$schema` pointer never leaks
// Into the runtime config.
export const parseVirrunConfiguration = (content: string): VirrunConfiguration =>
  getResult(() => virrunConfigurationSchema.parse(JSON.parse(content))).match(
    ({ backend }) => ({ backend }),
    (error) => {
      throw new InvalidOperationError(
        Operation.Read,
        parseVirrunConfiguration.name,
        error instanceof Error ? error.message : String(error),
      );
    },
  );
