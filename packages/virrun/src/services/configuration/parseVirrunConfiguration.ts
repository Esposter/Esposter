import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { virrunConfigurationSchema } from "@/models/virrun/VirrunConfiguration";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
// Parse and validate the raw `virrun.config.json` text into a VirrunConfiguration. JSON.parse + the zod schema run
// In one getResult, so malformed JSON, an unknown key (a typo), and a bad `backend` all surface the same way. Throws,
// Not getResult, because a malformed committed config is a developer error to surface at the call site, not a
// Recoverable runtime condition. The result is rebuilt from `backend` alone so the editor-only `$schema` pointer the
// Schema tolerates never leaks into the runtime config.
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
