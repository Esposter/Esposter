import type { SubCommandsDef } from "citty";

import { serveSharedBrowser } from "#src/services/genshinParity/browser/serveSharedBrowser";
import { startSharedBrowser } from "#src/services/genshinParity/browser/startSharedBrowser";
import { stopSharedBrowser } from "#src/services/genshinParity/browser/stopSharedBrowser";
import { defineCommand } from "citty";

// The one Edge every parity command opens its pages in, as a context of its own, so none of them launches an Edge
export const browserCommand: SubCommandsDef[string] = defineCommand({
  meta: { description: "Start or stop the one Edge every parity command shares", name: "browser" },
  subCommands: {
    start: defineCommand({
      meta: { description: "Start the shared Edge, detached, so it outlives this command", name: "start" },
      run: () => startSharedBrowser(),
    }),
    stop: defineCommand({
      meta: { description: "Stop the shared Edge and its process", name: "stop" },
      run: () => stopSharedBrowser(),
    }),
    serve: defineCommand({
      meta: { description: "Hold the shared Edge in this process, which `browser start` runs detached", name: "serve" },
      run: () => serveSharedBrowser(),
    }),
  },
});
