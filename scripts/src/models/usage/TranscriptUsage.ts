import type { UsageTotal } from "#src/models/usage/UsageTotal";

// One transcript's sums for one family, with the first user message that opened it
export interface TranscriptUsage extends UsageTotal {
  path: string;
  prompt: string;
}
