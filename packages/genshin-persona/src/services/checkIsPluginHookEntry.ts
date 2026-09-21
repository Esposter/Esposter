import type { HookEntry } from "#src/models/HookEntry";

import { PLUGIN_MARKER } from "#src/services/constants";

// Ours whether it points at the launcher or at a script path an earlier install pasted by hand; a command that is
// Not a string is a hand edit, and nobody's
export const checkIsPluginHookEntry = ({ hooks }: HookEntry): boolean =>
  hooks.some(({ command }) => typeof command === "string" && command.includes(PLUGIN_MARKER));
