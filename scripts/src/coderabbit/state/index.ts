import { readHarbourState } from "#src/services/coderabbit/state/readHarbourState";
import { defineCommand, runMain } from "citty";

// `pnpm ai:coderabbit:state` — the collector's state as JSON, for the agent console's harbour view
await runMain(
  defineCommand({
    meta: {
      description: "The review collector's state as JSON, read the way a pass reads it",
      name: "ai:coderabbit:state",
    },
    run: () => {
      console.info(JSON.stringify(readHarbourState(), null, 2));
    },
  }),
);
