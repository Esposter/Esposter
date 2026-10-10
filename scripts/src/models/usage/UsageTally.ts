import type { TranscriptUsage } from "#src/models/usage/TranscriptUsage";
import type { UsageTotal } from "#src/models/usage/UsageTotal";

// Everything counted so far: the message ids already taken, then the sums by bucket and family and by transcript
export interface UsageTally {
  seenIds: Set<string>;
  totals: Map<string, UsageTotal>;
  transcripts: Map<string, TranscriptUsage>;
}
