import type { SpinnerTipsOverride } from "#src/models/SpinnerTipsOverride";
import type { SpinnerVerbs } from "#src/models/SpinnerVerbs";
import type { StatusLine } from "#src/models/StatusLine";
import type { UserHooks } from "#src/models/UserHooks";

// The four keys of the user settings file a plugin cannot ship and this one writes; every other key passes
// Through untouched
export interface UserSettings {
  [key: string]: unknown;
  hooks?: UserHooks;
  spinnerTipsOverride?: SpinnerTipsOverride;
  spinnerVerbs?: SpinnerVerbs;
  statusLine?: StatusLine;
}
