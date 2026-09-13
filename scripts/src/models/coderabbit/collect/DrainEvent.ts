import type { DrainContentBlock } from "#src/models/coderabbit/collect/DrainContentBlock";

// The events Claude Code prints one per line with `--output-format stream-json`, as much of each as the log
// Reads: the model the session opened with, each assistant turn, and the result with what it cost. Tool
// Results arrive as `user` events and are dropped — they are the tree the session is reading, and the assistant
// Narrates what it found. Field names are the wire format's own.
export type DrainEvent =
  | {
      duration_ms: number;
      num_turns: number;
      result?: string;
      subtype: string;
      total_cost_usd: number;
      type: "result";
    }
  | { message: { content: DrainContentBlock[] }; type: "assistant" }
  | { model?: string; subtype: string; type: "system" }
  | { type: "user" };
