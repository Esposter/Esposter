import type { DrainEvent } from "#src/models/coderabbit/collect/DrainEvent";
import type { DrainLogLine } from "#src/models/coderabbit/collect/DrainLogLine";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// A tool call's input is shown by its first string field — the command, the path, the pattern — on one line,
// Which is what tells `git commit` from `pnpm typecheck` without printing a whole file edit into the log
const TOOL_INPUT_LENGTH = 160;

// One log line per event, so the job log reads as the session happens rather than as one block when it ends:
// The model that answered, each tool call, the prose between them, and the result with its turns and cost. A
// Line that is not an event prints as it is — Claude Code refusing to start writes a sentence, never JSON, and
// That sentence is what the limit parser reads.
export const getDrainEventLine = (line: string): DrainLogLine | undefined => {
  const event = getResult(() => parseMachineJson<DrainEvent | null>(line)).unwrapOr(undefined);
  if (!event || typeof event !== "object") return { isNarration: false, text: line };
  else if (event.type === "system")
    return event.subtype === "init"
      ? { isNarration: false, text: `session: model ${event.model ?? "unknown"}` }
      : undefined;
  else if (event.type === "assistant") {
    const lines = event.message.content.map((block) => {
      if (block.type === "text") return block.text.trim();
      else if (block.type === "tool_use") {
        const input = Object.values(block.input).find((value) => typeof value === "string") ?? "";
        const summary = input.split("\n")[0]?.slice(0, TOOL_INPUT_LENGTH) ?? "";
        return `→ ${block.name} ${summary}`.trim();
      }

      // A thinking block, and any kind a later release adds. Read as a tool call it would take `input` off a
      // Block that has none, and the throw would end the cycle mid-drain rather than the line
      return "";
    });
    const text = lines.filter(Boolean).join("\n");
    return text ? { isNarration: true, text } : undefined;
  } else if (event.type === "result") {
    const minutes = Temporal.Duration.from({ milliseconds: event.duration_ms }).total("minutes").toFixed(1);
    const summary = `result: ${event.subtype} after ${event.num_turns} turns in ${minutes} min, $${event.total_cost_usd.toFixed(2)}`;
    // A result is Claude Code's own frame whatever its subtype claims, so it is never narration. The refusal to
    // Start arrives here as `success` — one turn, no cost, the limit's sentence in `result` — while the process
    // Exits non-zero, so a subtype read as proof the session ran hid the one line the limit parser exists to
    // Find, and the review spent its whole quarantine budget on an outage. The exit status is what separates a
    // Session that ran from one that never began, and the caller already reads it (`runDrain`).
    return { isNarration: false, text: event.result ? `${summary}\n${event.result}` : summary };
  }

  return undefined;
};
