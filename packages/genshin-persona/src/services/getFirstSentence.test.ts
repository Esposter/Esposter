import { getFirstSentence } from "#src/services/getFirstSentence";
import { describe, expect, test } from "vitest";

describe(getFirstSentence, () => {
  const sentence = "a.";

  test.each([
    ["a plain sentence", `${sentence} b.`, sentence],
    ["a heading and a bullet", `# ${sentence}\n- b.`, sentence],
    ["a fenced block before the prose", `\`\`\`ts\nb();\n\`\`\`\n${sentence}`, sentence],
    ["inline code, a link and emphasis", `**[\`${sentence}\`](b)**`, sentence],
    ["a table row before the prose", `| b |\n${sentence}`, sentence],
    ["prose with no terminator", "a", "a"],
    ["nothing but code", "```ts\nb();\n```", ""],
    ["nothing but an unterminated fenced block", "```ts\nb();", ""],
    ["a sentence with no Latin letter", "あ。", ""],
  ])("%s: keeps the first sentence of the prose", (_case, markdown, expected) => {
    expect.hasAssertions();

    expect(getFirstSentence(markdown)).toBe(expected);
  });
});
