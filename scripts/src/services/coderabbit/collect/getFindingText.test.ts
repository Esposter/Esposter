import { getFindingText } from "#src/services/coderabbit/collect/getFindingText";
import { describe, expect, test } from "vitest";

describe(getFindingText, () => {
  test("keeps the reasoning, the proposed fix and the agent prompt", () => {
    expect.hasAssertions();
    const body = [
      "_🎯 Functional Correctness_ | _🟡 Minor_",
      "",
      "**Reject unsupported object flags.**",
      "",
      "The parser treats every flags value other than `DELTA_FLAG` as a keyframe.",
      "",
      "<details>",
      "<summary>Proposed fix</summary>",
      "",
      "```diff",
      "-  if (bytes[OBJECT_FLAGS_OFFSET] !== DELTA_FLAG)",
      "+  if (flags !== 0 && flags !== DELTA_FLAG)",
      "```",
      "</details>",
      "",
      "<details>",
      "<summary>🤖 Prompt for AI Agents</summary>",
      "",
      "In parseObject.ts around line 31, accept only 0 and DELTA_FLAG.",
      "</details>",
    ].join("\n");
    expect(getFindingText(body)).toBe(body);
  });

  test("drops the hidden comments and the static-analysis transcript", () => {
    expect.hasAssertions();
    const body = [
      "<details>",
      "<summary>🔎 Supported by static analysis</summary>",
      "",
      "🏁 Script executed:",
      "",
      "```shell",
      "rg -n 'collect' --glob '*.ts'",
      "```",
      "",
      "Length of output: 50374",
      "</details>",
      "",
      "**Persist failed snapshot collection work for retry.**",
      "",
      "<!-- fingerprinting:phantom:poseidon:lion -->",
      "",
      "<!-- This is an auto-generated comment by CodeRabbit",
      "<consolidated_sites>",
      "<site><file>a.ts</file></site>",
      "</consolidated_sites>",
      "-->",
    ].join("\n");
    expect(getFindingText(body)).toBe("**Persist failed snapshot collection work for retry.**");
  });
});
