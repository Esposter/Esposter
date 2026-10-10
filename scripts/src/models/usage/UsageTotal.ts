import type { UsageBucket } from "#src/models/usage/UsageBucket";

// One bucket and family's token sums over the window, with the turns they came from
export interface UsageTotal {
  bucket: UsageBucket;
  cacheRead: number;
  cacheWrite: number;
  context: number;
  family: string;
  output: number;
  turns: number;
}
