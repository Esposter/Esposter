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

  test("drops a turn's thinking, keeping the tool call beside it", () => {
    expect.hasAssertions();

    const event = {
      message: {
        content: [
          { signature: "abc", thinking: "The flag check reads `<` where it wants `<=`.", type: "thinking" },
          { input: { command: "pnpm typecheck" }, name: "Bash", type: "tool_use" },
        ],
      },
      type: "assistant",
    };
    expect(getDrainEventLine(JSON.stringify(event))).toStrictEqual({
      isNarration: true,
      text: "→ Bash pnpm typecheck",
    });
  });

  test("drops a tool result and an empty turn", () => {
    expect.hasAssertions();

    expect(getDrainEventLine(JSON.stringify({ message: { content: [] }, type: "user" }))).toBeUndefined();
    expect(
      getDrainEventLine(JSON.stringify({ message: { content: [{ text: " ", type: "text" }] }, type: "assistant" })),
    ).toBeUndefined();
  });

  test("prints a successful result with its turns and cost, as Claude Code's own", () => {
    expect.hasAssertions();

    const event = {
      duration_ms: Temporal.Duration.from({ minutes: 12, seconds: 30 }).total("milliseconds"),
      num_turns: 41,
      result: "Fixed the session limit parser; every finding is answered.",
      subtype: "success",
      total_cost_usd: 3.456,
      type: "result",
    };
    expect(getDrainEventLine(JSON.stringify(event))).toStrictEqual({
      isNarration: false,
      text: "result: success after 41 turns in 12.5 min, $3.46\nFixed the session limit parser; every finding is answered.",
    });
  });

  // The shape the refusal to start actually takes: `success`, one turn, no cost, and the limit's own sentence in
  // `result`. Read as the model's closing message it never reaches the limit parser, and the outage is counted
  // Against the review's quarantine budget instead
  test("prints a refusal wearing a successful subtype as Claude Code's own", () => {
    expect.hasAssertions();

    const event = {
      duration_ms: 421,
      num_turns: 1,
      result: "You've hit your session limit · resets 3:20am (UTC)",
      subtype: "success",
      total_cost_usd: 0,
      type: "result",
    };
    expect(getDrainEventLine(JSON.stringify(event))).toStrictEqual({
      isNarration: false,
      text: "result: success after 1 turns in 0.0 min, $0.00\nYou've hit your session limit · resets 3:20am (UTC)",
    });
  });

  test("prints a failed result's text as Claude Code's own", () => {
    expect.hasAssertions();

    const event = {
      duration_ms: 1,
      num_turns: 0,
      result: "You've hit your session limit · resets 3:10am (UTC)",
      subtype: "error_during_execution",
      total_cost_usd: 0,
      type: "result",
    };
    expect(getDrainEventLine(JSON.stringify(event))).toStrictEqual({
      isNarration: false,
      text: "result: error_during_execution after 0 turns in 0.0 min, $0.00\nYou've hit your session limit · resets 3:10am (UTC)",
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
