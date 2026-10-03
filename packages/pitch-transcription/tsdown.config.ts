import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `notes` is note creation alone, for a worker or a server that builds notes from readings it already has and never
// Loads TensorFlow.js
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  entry: { index: "src/index.ts", notes: "src/notes.ts" },
});

export default tsdownConfiguration;
