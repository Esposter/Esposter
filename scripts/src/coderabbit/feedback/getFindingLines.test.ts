import { getFindingLines } from "#src/coderabbit/feedback/getFindingLines";
import { describe, expect, test } from "vitest";

describe(getFindingLines, () => {
  test("suppresses a boilerplate section and everything under it", () => {
    expect.hasAssertions();

    expect(getFindingLines("📒 Files selected for processing (4)\n- a.ts\n- b.ts")).toStrictEqual([]);
  });

  // The categories are not a fixed set, so a filter selecting known bucket names loses whichever one it never
  // Heard of — and one carrying a boilerplate emoji is the case that looks suppressed on purpose
  test("prints a bucket it has never seen, emoji and all", () => {
    expect.hasAssertions();

    expect(getFindingLines("🤖 Prompt for AI Agents\nagent text\n🤖 New findings (2)\na finding")).toStrictEqual([
      "🤖 New findings (2)",
      "a finding",
    ]);
  });

  // Without a markdown heading reopening the filter, the walkthrough's first counted section latches and eats
  // Every later one — the merge risk included — while the script still exits 0
  test("reopens on a markdown heading after a boilerplate section", () => {
    expect.hasAssertions();

    expect(getFindingLines("📒 Files selected for processing (4)\n- a.ts\n## Merge Risk\nhigh")).toStrictEqual([
      "## Merge Risk",
      "high",
    ]);
  });

  test("drops fenced blocks, which carry agent prompts rather than findings", () => {
    expect.hasAssertions();

    expect(getFindingLines("**Actionable comments posted: 1**\n```\nprompt text\n```\nthe finding")).toStrictEqual([
      "**Actionable comments posted: 1**",
      "the finding",
    ]);
  });

  test("strips the embedded html the raw markdown carries", () => {
    expect.hasAssertions();

    expect(getFindingLines("<details>\n<summary>🧹 Nitpick comments (1)</summary>\nthe nitpick")).toStrictEqual([
      "🧹 Nitpick comments (1)",
      "the nitpick",
    ]);
  });
});
