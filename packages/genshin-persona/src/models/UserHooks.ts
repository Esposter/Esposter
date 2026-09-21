import type { HookEntry } from "#src/models/HookEntry";

// The `hooks` user setting: the one event this plugin writes an entry under, and every other event untouched
export interface UserHooks {
  [event: string]: unknown;
  MessageDisplay?: HookEntry[];
}
