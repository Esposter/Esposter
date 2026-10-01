import { parseWikiStoryLines } from "#src/services/parseWikiStoryLines";
import { describe, expect, test } from "vitest";

describe(parseWikiStoryLines, () => {
  test("composes each line's stem and title through the template's placeholders", () => {
    expect.hasAssertions();

    const wikitext = `{{VO/Story
|character = a
|vo_01_01_title = {character}: b
|vo_01_01_file = VO_{language}{character} {character} - b.ogg
|vo_01_01_tx = [[a|b]] {{Ref}} &mdash; '''a'''
}}
{{VO/Combat
|vo_02_01_title = a
|vo_02_01_file = VO_{language}{character} a.ogg
|vo_02_01_tx = a
}}`;

    expect(parseWikiStoryLines(wikitext)).toStrictEqual([{ stem: "a a - b", text: "b — a", title: "a: b" }]);
  });

  test("reads a page that leaves the dub to the template the same way", () => {
    expect.hasAssertions();

    const wikitext = `{{VO/Story
|character = a
|vo_01_01_title = b
|vo_01_01_file = VO_{character} b.ogg
|vo_01_01_tx = a
}}`;

    expect(parseWikiStoryLines(wikitext)).toStrictEqual([{ stem: "a b", text: "a", title: "b" }]);
  });

  test("lists nothing for a page without the story template", () => {
    expect.hasAssertions();

    expect(parseWikiStoryLines("")).toStrictEqual([]);
  });
});
