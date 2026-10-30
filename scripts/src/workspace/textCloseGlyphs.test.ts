import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("getTextCloseGlyphs", () => {
  // A close is the game's glyph, which `CloseButton` draws from `CloseButtonMarkGlyphMap`.
  // So a text glyph is a font the game does not draw.
  // A `✕` anywhere in a component's template is one, and so is a `×` that is the only text of a button.
  // A `×` beside a count (`×10`, `× 3`) is no close and is left alone
  const TEXT_CLOSE_REGEX = /✕|<button\b[^>]*>\s*×\s*<\/button>/gu;

  // Every `<path>:<line> → <text>` where a component draws a close as a text glyph.
  // A button is matched across its lines, so a `×` on a line of its own is no way round the check
  const getTextCloseGlyphs = (files: { path: string; text: string }[]): string[] =>
    files.flatMap(({ path, text }) =>
      Array.from(
        text.matchAll(TEXT_CLOSE_REGEX),
        (match) => `${path}:${text.slice(0, match.index).split("\n").length} → ${match[0]}`,
      ),
    );

  test.each([
    ["a literal cross", '<p class="close">✕</p>'],
    ["a multiplication sign as a button's only text", '<button class="close" type="button">×</button>'],
    ["a multiplication sign alone across a button's lines", '<button class="close">\n  ×\n</button>'],
  ])("flags %s", (_label, text) => {
    expect.hasAssertions();

    expect(getTextCloseGlyphs([{ path: "a.vue", text }])).toHaveLength(1);
  });

  test.each([
    ["a count beside a multiplication sign", "<span>{{ name }} × {{ count }}</span>"],
    ["a multiplication sign before a count in a button", "<button>×{{ quantity }}</button>"],
    ["the shared close button's cross", '<CloseButton class="close" :mark="CloseButtonMark.Cross" />'],
  ])("leaves %s alone", (_label, text) => {
    expect.hasAssertions();

    expect(getTextCloseGlyphs([{ path: "a.vue", text }])).toStrictEqual([]);
  });

  // Why the check exists: a close drawn as a font is the wrong glyph on every screen that takes it.
  // The one place a reviewer reads for it is the design page, which already said the close is the game's glyph
  test("no component draws a close as a text glyph", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const files = readSweepFilePaths(
      "packages/genshin-interface/src/components",
      "packages/genshin-world/src/components",
    )
      .filter((path) => path.endsWith(".vue"))
      .map((path) => ({ path, text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8") }));

    expect(getTextCloseGlyphs(files)).toStrictEqual([]);
  });
});
