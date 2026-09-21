import type { HookCommand } from "#src/models/HookCommand";

// One entry of a hook event's list in user settings, as the tool spells it; a matcher passes through
export interface HookEntry {
  [key: string]: unknown;
  hooks: HookCommand[];
}
