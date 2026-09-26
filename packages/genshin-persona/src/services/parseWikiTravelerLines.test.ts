import { TravelerGender } from "#src/models/TravelerGender";
import { parseWikiTravelerLines } from "#src/services/parseWikiTravelerLines";
import { describe, expect, test } from "vitest";

describe(parseWikiTravelerLines, () => {
  const wikitext = `{{VO/Traveler
|vo_01_01_title      = a
|vo_01_01_file_male  = VO_{language}{character1}_a.ogg
|vo_01_01_file_female= VO_{language}{character2}_a.ogg
|vo_01_01_tx         = '''a:''' a<br><!--
                    -->'''{{Traveler}}:''' a

|vo_01_02_title      = b
|vo_01_02_file_male  = VO_{language}{character1}_b.ogg
|vo_01_02_file_female= VO_{language}{character2}_b.ogg
|vo_01_02_tx         = '''{{Traveler}}:''' {{MC|a|b|mc=1}} [[a|b]].<br><!--
                    -->'''a:''' a
}}`;

  test("keeps the lines the twin opens, as their opening turn with their own word choice, under their own file", () => {
    expect.hasAssertions();

    expect(
      parseWikiTravelerLines(wikitext, "name", { gender: TravelerGender.Female, namePlaceholder: "{character2}" }),
    ).toStrictEqual([{ stem: "name b", text: "b b.", title: "b" }]);
  });
});
