import type { UsageBucket } from "#src/models/usage/UsageBucket";

// One transcript file read into lines, with the bucket it sits in and the prompt that opened it
export interface UsageTranscript {
  bucket: UsageBucket;
  lines: readonly string[];
  path: string;
  prompt: string;
}
