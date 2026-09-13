import { getDrainEventLine } from "#src/services/coderabbit/collect/getDrainEventLine";
import { describe, expect, test } from "vitest";

describe(getDrainEventLine, () => {
  test("names the model the session opened with", () => {
    expect.hasAssertions();
    expect(getDrainEventLine(JSON.stringify({ model: "claude-opus", subtype: "init", type: "system" }))).toStrictEqual({
      isNarration: false,
      text: "session: model claude-opus",
    });
    expect(getDrainEventLine(JSON.stringify({ subtype: "compact_boundary", type: "system" }))).toBeUndefined();
  });

  test("prints an assistant turn as its prose and its tool calls, as narration", () => {
    expect.hasAssertions();
    const event = {
      message: {
        content: [
          { text: "Fixing the flag check.\n", type: "text" },
          {
            input: { command: "git commit -m 'fix' --trailer 'Answers: 1'\necho done", description: "Commit" },
            name: "Bash",
            type: "tool_use",
          },
          {
            input: { file_path: "packages/keyframe-store/src/services/parseObject.ts", old_string: "a" },
            name: "Edit",
            type: "tool_use",
          },
        ],
      },
      type: "assistant",
    };
    expect(getDrainEventLine(JSON.stringify(event))).toStrictEqual({
      isNarration: true,
      text: "Fixing the flag check.\n→ Bash git commit -m 'fix' --trailer 'Answers: 1'\n→ Edit packages/keyframe-store/src/services/parseObject.ts",
    });
  });

  test("drops a tool result and an empty turn", () => {
    expect.hasAssertions();
    expect(getDrainEventLine(JSON.stringify({ message: { content: [] }, type: "user" }))).toBeUndefined();
    expect(
      getDrainEventLine(JSON.stringify({ message: { content: [{ text: " ", type: "text" }] }, type: "assistant" })),
    ).toBeUndefined();
  });

  test("prints the result with its turns and cost, and the sentence it ended on", () => {
    expect.hasAssertions();
    const event = {
      duration_ms: Temporal.Duration.from({ minutes: 12, seconds: 30 }).total("milliseconds"),
      num_turns: 41,
      result: "Every finding is answered.",
      subtype: "success",
      total_cost_usd: 3.456,
      type: "result",
    };
    expect(getDrainEventLine(JSON.stringify(event))).toStrictEqual({
      isNarration: false,
      text: "result: success after 41 turns in 12.5 min, $3.46\nEvery finding is answered.",
    });
  });

  test("passes a line that is not an event through as Claude Code's own", () => {
    expect.hasAssertions();
    expect(getDrainEventLine("You've hit your session limit · resets 3:10am (UTC)")).toStrictEqual({
      isNarration: false,
      text: "You've hit your session limit · resets 3:10am (UTC)",
    });
    expect(getDrainEventLine("null")).toStrictEqual({ isNarration: false, text: "null" });
  });
});
