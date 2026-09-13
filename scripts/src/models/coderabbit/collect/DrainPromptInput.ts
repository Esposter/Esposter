import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";

// What the drain is told, which is its findings plus the two files it answers through. The drain holds no
// GitHub credential (`runDrain`), so a verdict it reaches leaves the session as a written line and the
// Collector posts it — the same split as an accepted finding, whose reply waits for the push.
export interface DrainPromptInput extends DrainInput {
  // One `<comment id> <reason>` line per inline finding the drain rejected
  rejectionsPath: string;
  // The body-only verdict lines, posted under the `Drains` marker when every one of them was rejected
  verdictPath: string;
}
