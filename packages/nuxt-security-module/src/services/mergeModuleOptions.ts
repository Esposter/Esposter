import type { ModuleOptions } from "#src/models/ModuleOptions";

import { mergeHeaders } from "#src/services/mergeHeaders";

// A consumer's options laid over the defaults.
// The two policies that are lists per directive or per feature are merged additively.
// A consumer's sources are appended to the default ones.
// A `false` removes a directive or feature, and a `true` sets a flag-only directive.
// Every other option is replaced as a whole.
// The override that replaces `script-src` with `'unsafe-eval'` is why this is additive.
// A replacement would drop the nonce and `'strict-dynamic'`.
export const mergeModuleOptions = (defaults: ModuleOptions, overrides: Partial<ModuleOptions>): ModuleOptions => ({
  ...defaults,
  ...overrides,
  headers: mergeHeaders(defaults.headers, overrides.headers),
  ssg: overrides.ssg === false ? false : ({ ...defaults.ssg, ...overrides.ssg } as ModuleOptions["ssg"]),
});
