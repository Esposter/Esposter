import type { HookEntry } from "#src/models/HookEntry";

import { PLUGIN_MARKER } from "#src/services/constants";

// Ours whether it points at the launcher or at a script path an earlier install pasted by hand; a command shaped
// Unlike the model — the file is the person's to hand-edit — is a hand edit, and nobody's
export const checkIsPluginHookEntry = ({ hooks }: HookEntry): boolean =>
  hooks.some((hook) => typeof hook?.command === "string" && hook.command.includes(PLUGIN_MARKER));
