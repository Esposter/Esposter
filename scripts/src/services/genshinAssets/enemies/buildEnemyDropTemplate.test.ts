import { buildEnemyDropTemplate } from "#src/services/genshinAssets/enemies/buildEnemyDropTemplate";
import { DROPS_DATA_WIKI_TITLE, DROPS_TEMPLATE_WIKI_TITLE } from "#src/services/genshinAssets/enemies/constants";
import { AVATAR_OF_LAVA_DROPS_ENTRY, DROPS_TEMPLATE_PAGE } from "#src/services/genshinAssets/enemies/constants.test";
import { writeWikiPage } from "#src/services/genshinAssets/enemies/writeWikiPage.test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(buildEnemyDropTemplate, () => {
  // The drops module's data as the wiki gives it, cut down to the entries these tests read: an entry whose members name
  // A template, and one whose material set is conditional on a named state
  const DROPS_DATA = `return {
	['Enemies'] = {
		${AVATAR_OF_LAVA_DROPS_ENTRY},
		{
			members = {'Fungi'},
			MatSet1 = {'Fungal Spores' , 'Luminescent Pollen' , 'Crystalline Cyst Dust'},
			SpecMatSet1 = {'Inactivated Fungal Nucleus' , 'Dormant Fungal Nucleus' , 'Robust Fungal Nucleus' , condition = 'Activated/Scorched'}
		},
	}
}`;
  const NAME_ITEM_IDS_MAP = new Map<string, number[]>([
    ["Crystalline Cyst Dust", [113003]],
    ["Fungal Spores", [113001]],
    ["Ignited Seed of Life", [112111]],
    ["Ignited Seeing Eye", [112112]],
    ["Ignited Stone", [112110]],
    ["Luminescent Pollen", [113002]],
  ]);

  let cacheDirectory: string;

  beforeEach(async () => {
    cacheDirectory = await mkdtemp(join(tmpdir(), "enemy-drop-templates-"));
    await writeWikiPage(cacheDirectory, DROPS_TEMPLATE_WIKI_TITLE, DROPS_TEMPLATE_PAGE);
    await writeWikiPage(cacheDirectory, DROPS_DATA_WIKI_TITLE, DROPS_DATA);
  });

  afterEach(async () => {
    await rm(cacheDirectory, { force: true, recursive: true });
  });

  test("a template's materials are its entry's material sets by tier, each resolved to its one item", () => {
    expect.hasAssertions();

    expect(buildEnemyDropTemplate("Avatar of Lava", NAME_ITEM_IDS_MAP, cacheDirectory)).toStrictEqual([
      { itemId: 112110, tier: 0 },
      { itemId: 112111, tier: 1 },
      { itemId: 112112, tier: 2 },
    ]);
  });

  test("a template whose entry has a conditional material set is refused rather than read without it", () => {
    expect.hasAssertions();

    expect(() => buildEnemyDropTemplate("Fungi", NAME_ITEM_IDS_MAP, cacheDirectory)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Fungi, has a conditional material set, which no template models]`,
    );
  });

  test("a template no entry of the drops module lists is refused", () => {
    expect.hasAssertions();

    expect(() =>
      buildEnemyDropTemplate("Nobody", NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Nobody, is in no Enemies entry of the drops module]`,
    );
  });

  test("a template that does not invoke the drops module is refused, since its materials are not the module's", async () => {
    expect.hasAssertions();
    await writeWikiPage(cacheDirectory, DROPS_TEMPLATE_WIKI_TITLE, "{{Card|Avatar of Lava}}");

    expect(() =>
      buildEnemyDropTemplate("Avatar of Lava", NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Template:Drops, does not invoke the drops module]`,
    );
  });
});
