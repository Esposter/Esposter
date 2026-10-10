import type { UsageTally } from "#src/models/usage/UsageTally";

import { UsageBucket } from "#src/models/usage/UsageBucket";
import { accumulateTranscriptLines } from "#src/services/usage/accumulateTranscriptLines";
import { describe, expect, test } from "vitest";

const createUsageLine = (id: string, requestId: string, model: string, milliseconds: number): string =>
  JSON.stringify({
    message: {
      id,
      model,
      usage: { cache_creation_input_tokens: 20, cache_read_input_tokens: 100, input_tokens: 10, output_tokens: 5 },
    },
    requestId,
    timestamp: new Date(milliseconds).toISOString(),
  });

describe(accumulateTranscriptLines, () => {
  test("counts each message once and leaves out synthetic, stale and unreadable lines", () => {
    expect.hasAssertions();

    const sinceMs = 1000;
    const tally: UsageTally = { seenIds: new Set(), totals: new Map(), transcripts: new Map() };
    const lines = [
      createUsageLine("first", "request", "claude-opus-5-5", 2000),
      createUsageLine("first", "request", "claude-opus-5-5", 2000),
      createUsageLine("second", "request", "claude-sonnet-5-5", 3000),
      createUsageLine("third", "request", "<synthetic>", 3000),
      createUsageLine("fourth", "request", "claude-opus-5-5", 500),
      '{"message":{"usage":',
      '{"type":"user"}',
    ];

    accumulateTranscriptLines(tally, { bucket: UsageBucket.Main, lines, path: "/session.jsonl", prompt: "" }, sinceMs);

    expect([...tally.totals.values()]).toStrictEqual([
      { bucket: UsageBucket.Main, cacheRead: 100, cacheWrite: 20, context: 130, family: "opus", output: 5, turns: 1 },
      { bucket: UsageBucket.Main, cacheRead: 100, cacheWrite: 20, context: 130, family: "sonnet", output: 5, turns: 1 },
    ]);
  });
});
