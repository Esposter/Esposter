import type { VoiceRuntime } from "#src/models/VoiceRuntime";

import { createRequire } from "node:module";

// The engine's runtime, resolved from the installed dependencies of the manifest or module given: the state
// Directory's, which the `voice` verb installed, or the repository's tooling package's for the reference
// Selection. Loaded through `require` so a runtime not installed yet fails inside the process that logs it,
// Never at link time
export const readVoiceRuntime = (from: string): VoiceRuntime => {
  const requireModule = createRequire(from);
  return requireModule("@huggingface/transformers") as VoiceRuntime;
};
