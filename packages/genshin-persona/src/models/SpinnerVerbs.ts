import type { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";

// The `spinnerVerbs` user setting as the tool spells it: the verbs shown while a turn runs, added to or replacing
// The built-in set
export interface SpinnerVerbs {
  mode: SpinnerVerbsMode;
  verbs: string[];
}
