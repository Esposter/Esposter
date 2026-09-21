import { getSpokenProse } from "#src/services/getSpokenProse";
import { describe, expect, test } from "vitest";

describe(getSpokenProse, () => {
  const sentence = "a.";

  test.each([
    ["every sentence of the prose", `${sentence} b.`, `${sentence} b.`],
    ["a heading and a bullet", `# ${sentence}\n- b.`, `${sentence} b.`],
    ["a fenced block between the prose", `${sentence}\n\`\`\`ts\nb();\n\`\`\`\nc.`, `${sentence} c.`],
    ["inline code, a link and emphasis", `**[\`${sentence}\`](b)**`, sentence],
    ["a table row between the prose", `${sentence}\n| b |\nc.`, `${sentence} c.`],
    ["nothing but an unterminated fenced block", "```ts\nb();", ""],
    ["prose with no Latin letter", "あ。", ""],
  ])("%s: keeps %s", (_case, markdown, expected) => {
    expect.hasAssertions();

    expect(getSpokenProse(markdown)).toBe(expected);
  });
});
