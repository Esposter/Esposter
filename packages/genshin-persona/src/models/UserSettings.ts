import type { SpinnerVerbs } from "#src/models/SpinnerVerbs";
import type { StatusLine } from "#src/models/StatusLine";

// The two keys of the user settings file a plugin cannot ship and this one writes; every other key passes through
// Untouched
export interface UserSettings {
  [key: string]: unknown;
  spinnerVerbs?: SpinnerVerbs;
  statusLine?: StatusLine;
}
