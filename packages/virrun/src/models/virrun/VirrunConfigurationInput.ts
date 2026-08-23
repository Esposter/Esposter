import type { BackendType } from "#src/models/virrun/BackendType";
import type { Environment } from "#src/models/virrun/Environment";
// The author-facing shape `defineConfig` accepts: each enum field also takes its raw string value
// (`"native"`, `"nuxt"`, …) via the template-literal union, so a `virrun.config.ts` never needs a value import of
// The enums (which would make jiti load the whole bundled barrel on every `virrun -- <cmd>`). Enum members remain
// Assignable to their literal types, so both spellings typecheck; `virrunConfigurationSchema` normalizes either
// Into the resolved `VirrunConfiguration` at load time.
export interface VirrunConfigurationInput {
  readonly backend?: `${BackendType}`;
  readonly environment?: `${Environment}`;
}
