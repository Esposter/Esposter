import { parseWikiStoryLines } from "#src/services/parseWikiStoryLines";
import { describe, expect, test } from "vitest";

describe(parseWikiStoryLines, () => {
  test("composes each line's stem and title through the template's placeholders", () => {
    expect.hasAssertions();

    const wikitext = `{{VO/Story
|character = Hu Tao
|vo_01_01_title = About {character}: Work
|vo_01_01_file = VO_{language}{character} About {character} - Work.ogg
|vo_01_01_tx = A [[Wangsheng Funeral Parlor|parlor]] {{Ref}} &mdash; '''open'''
}}
{{VO/Combat
|vo_02_01_title = Elemental Skill
|vo_02_01_file = VO_{language}{character} Elemental Skill.ogg
|vo_02_01_tx = Boo!
}}`;

    expect(parseWikiStoryLines(wikitext, "")).toStrictEqual([
      { stem: "Hu Tao About Hu Tao - Work", text: "A parlor — open", title: "About Hu Tao: Work" },
    ]);
  });

  test("reads a page that leaves the dub to the template the same way", () => {
    expect.hasAssertions();

    const wikitext = `{{VO/Story
|character = Sayu
|vo_01_01_title = Hello
|vo_01_01_file = VO_{character} Hello.ogg
|vo_01_01_tx = Sayu, at your disposal!
}}`;

    expect(parseWikiStoryLines(wikitext, "")).toStrictEqual([
      { stem: "Sayu Hello", text: "Sayu, at your disposal!", title: "Hello" },
    ]);
  });

  test("reads one script of a page that carries two by the field suffix", () => {
    expect.hasAssertions();

    const wikitext = `{{VO/Story
|character = Sayu
|vo_01_01_title_s = 初次见面…
|vo_01_01_title_t = 初次見面…
|vo_01_01_subtitle = Hello
|vo_01_01_file = VO_{language}{character} Hello.ogg
|vo_01_01_tx_s = 早柚
|vo_01_01_tx_t = {{MC|m=你|f=妳}}好，早柚
|vo_01_01_rm = Zǎoyòu
}}`;

    expect(parseWikiStoryLines(wikitext, "_t")).toStrictEqual([
      { stem: "Sayu Hello", text: "你好，早柚", title: "初次見面…" },
    ]);
  });

  test("lists nothing for a page without the story template", () => {
    expect.hasAssertions();

    expect(parseWikiStoryLines("", "")).toStrictEqual([]);
  });
});
