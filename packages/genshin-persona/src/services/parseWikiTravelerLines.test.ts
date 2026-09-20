import { TravelerGender } from "#src/models/TravelerGender";
import { parseWikiTravelerLines } from "#src/services/parseWikiTravelerLines";
import { describe, expect, test } from "vitest";

describe(parseWikiTravelerLines, () => {
  const wikitext = `{{VO/Traveler
|vo_01_01_title      = About the Windmills
|vo_01_01_file_male  = VO_{language}{character1}_About_the_Windmills.ogg
|vo_01_01_file_female= VO_{language}{character2}_About_the_Windmills.ogg
|vo_01_01_tx         = '''{name3}:''' So many windmills!<br><!--
                    -->'''{{Traveler}}:''' They draw the water up.

|vo_01_02_title      = About the Tavern Owner
|vo_01_02_file_male  = VO_{language}{character1}_About_the_Tavern_Owner.ogg
|vo_01_02_file_female= VO_{language}{character2}_About_the_Tavern_Owner.ogg
|vo_01_02_tx         = '''{{Traveler}}:''' A tip makes them {{MC|give|share|mc=1}} [[Angel's Share|news]].<br><!--
                    -->'''{name3}:''' How big a tip?
}}`;

  test("keeps the lines the twin opens, as their opening turn with their own word choice, under their own file", () => {
    expect.hasAssertions();

    expect(
      parseWikiTravelerLines(wikitext, "Lumine", {
        gender: TravelerGender.Female,
        namePlaceholder: "{character2}",
      }),
    ).toStrictEqual([
      { stem: "Lumine About the Tavern Owner", text: "A tip makes them share news.", title: "About the Tavern Owner" },
    ]);
  });
});
