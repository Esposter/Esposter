import { UiToken } from "@/models/ui/UiToken";
import { uiHighlightSpecs } from "@/services/codemirror/uiHighlightSpecs";
import { tags } from "@lezer/highlight";
import { describe, expect, test } from "vitest";

// A tag reaches its colour through the row listing it, since a row may hold several tags as an array
const getColor = (tag: typeof tags.comment) => uiHighlightSpecs.find((spec) => [spec.tag].flat().includes(tag))?.color;

describe("uiHighlightSpecs", () => {
  // Each scope the docs' shiki theme colours lands on the token it lands on there, and nothing else
  test.each([
    ["comments", UiToken.Muted, tags.comment],
    ["keywords", UiToken.Accent, tags.keyword],
    ["strings", UiToken.Success, tags.string],
    ["type names", UiToken.Info, tags.typeName],
    ["numbers", UiToken.Warning, tags.number],
    ["deletions", UiToken.Error, tags.deleted],
  ])("colours %s as the %s token", (_name, token, tag) => {
    expect.hasAssertions();

    expect(getColor(tag)).toBe(`var(--ui-${token})`);
  });
});
