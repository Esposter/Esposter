import type { HookEntry } from "#src/models/HookEntry";

import { SPEAK_LAUNCHER_PATH } from "#src/services/constants";
import { toForwardSlashes } from "#src/util/toForwardSlashes";

// The entry the `voice` verb writes under the MessageDisplay event: the tool hands it every flushed piece of a reply
// As the reply is displayed, which is where a spoken line is read from before the reply is complete
export const getPluginSpeakHookEntry = (): HookEntry => ({
  hooks: [{ command: `node "${toForwardSlashes(SPEAK_LAUNCHER_PATH)}"`, type: "command" }],
});
