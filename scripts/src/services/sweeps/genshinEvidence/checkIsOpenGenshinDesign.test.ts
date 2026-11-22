import { checkIsOpenGenshinDesign } from "#src/services/sweeps/genshinEvidence/checkIsOpenGenshinDesign";
import { describe, expect, test } from "vitest";

describe(checkIsOpenGenshinDesign, () => {
  test.each([
    ["a no-source-yet line in prose", "The palette is no source yet.\n\n## Sources\n- a link", true],
    ["neither a Sources section nor a parity path", "# Design\n\nProse only.", true],
    ["only an unchecked task names the question", "- [ ] no source yet\n\n## Sources\n- a link", false],
    ["a parity reference stands in for a Sources section", "# Design\n\ngenshin-parity/references/a.png", false],
  ])("is open for %s", (_description, text, expected) => {
    expect.hasAssertions();

    expect(checkIsOpenGenshinDesign(text)).toBe(expected);
  });
});
