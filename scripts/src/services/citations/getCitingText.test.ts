import { getCitingText } from "#src/services/citations/getCitingText";
import { describe, expect, test } from "vitest";

describe(getCitingText, () => {
  test("drops a fence", () => {
    expect.hasAssertions();

    expect(getCitingText("`a`\n```\n`b`\n```\n`c`")).toBe("`a`\n\n`c`");
  });

  // A fence read as backtick pairs shifts every pairing after it, so what follows is cited from the wrong tokens
  test("drops a fence whose body holds a single backtick", () => {
    expect.hasAssertions();

    expect(getCitingText("```\n`\n```\n`a`")).toBe("\n`a`");
  });

  // A list item's block is indented by the item's own content column, which is most of the fences in the skill tree
  test("drops an indented fence", () => {
    expect.hasAssertions();

    expect(getCitingText("`a`\n  ```\n  `b`\n  ```\n`c`")).toBe("`a`\n\n`c`");
  });

  test("drops a tilde fence", () => {
    expect.hasAssertions();

    expect(getCitingText("~~~\n`a`\n~~~\n`b`")).toBe("\n`b`");
  });

  // A fence closes on a run of its own length or longer, so the example fence inside this one is its content
  test("drops a four-backtick fence whose body holds a three-backtick fence", () => {
    expect.hasAssertions();

    expect(getCitingText("````\n```\n`a`\n```\n````\n`b`")).toBe("\n`b`");
  });

  test("drops a double-backtick span and the backticked phrase inside it", () => {
    expect.hasAssertions();

    expect(getCitingText("``the `a` skill`` `b`")).toBe(" `b`");
  });

  // Markdown closes a span on a run of its opener's length alone, so a longer run inside one is literal text
  test("keeps a single-backtick span whose body holds a longer run", () => {
    expect.hasAssertions();

    expect(getCitingText("` ```(a|b)` `c`")).toBe("` ```(a|b)` `c`");
  });

  test("keeps a run nothing closes", () => {
    expect.hasAssertions();

    expect(getCitingText("``a `b`")).toBe("``a `b`");
  });
});
