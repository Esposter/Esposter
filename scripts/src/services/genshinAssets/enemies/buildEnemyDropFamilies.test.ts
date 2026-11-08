import { buildEnemyDropFamilies } from "#src/services/genshinAssets/enemies/buildEnemyDropFamilies";
import { DROPS_TABLE_WIKI_MODULE_TITLE } from "#src/services/genshinAssets/enemies/constants";
import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { EnemyKindId, EnemyType } from "genshin-world";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const writeWikiPage = (cacheDirectory: string, title: string, content: string): Promise<void> =>
  writeFile(
    toWikiPageCachePath(cacheDirectory, title),
    JSON.stringify({ query: { pages: [{ revisions: [{ slots: { main: { content } } }], title }] } }),
  );

describe(buildEnemyDropFamilies, () => {
  // The wiki's Enemies table in its own Lua, cut down to the families these tests join: a family whose article lists a
  // Drops Table of a member that is no family's first, one whose second member is its activated state, and one with a fixed count
  const DROPS_MODULE = `return {
	MoraRate = { { '0.425', '0.5' } },
	Enemies = {
		{
			members = {'Hilichurls'},
			MatSet1 = { names = {'Damaged Mask' , 'Stained Mask' , 'Ominous Mask'}, nums = { 0.4202, 0.1120, 0.0280 }},
			mora = 32
		},
		{
			members = {'Fungi (Small)'},
			MatSet1 = { names = {'Fungal Spores' , 'Luminescent Pollen' , 'Crystalline Cyst Dust'}, nums = { 0.8484, 0.2241, 0.0560 }},
			mora = 32
		},
		{
			members = {'Fungi (Small, Activated)'},
			MatSet1 = { names = {'Inactivated Fungal Nucleus' , 'Dormant Fungal Nucleus' , 'Robust Fungal Nucleus'}, nums = { 0.8484, 0.2241, 0.0560 }},
			mora = 32
		},
		{
			members = {'Samachurls'},
			MatSet1 = { names = {'Divining Scroll' , 'Sealed Scroll' , 'Forbidden Curse Scroll'}, nums = { 2.5212, 0.6723, 0.1680 }},
			MatSet2 = { names = {'Damaged Mask' , 'Stained Mask' , 'Ominous Mask'}, nums = { 0.1681, 0.0448, 0.0112 }},
			mora = 32
		},
		{
			members = {'Sumpter Beast (Hilichurls)'},
			MatSet1 = { names = {'Damaged Mask' , 'Stained Mask' , 'Ominous Mask'}, nums = { 2.5212, 0.6723, 0.1680 } },
			MatSet2 = { names = 'Raw Meat', nums = '3', fixed = 1 },
			mora = 32
		},
	}
}`;

  const ENGLISH_TEXT_MAP = new Map([
    ["1", "Hilichurl Fighter"],
    ["2", "Floating Anemo Fungus"],
    ["3", "Dendro Samachurl"],
    ["4", "Eroding Avatar of Lava"],
    ["5", "Anemo Hypostasis"],
    ["6", "Hilichurl Shooter"],
  ]);

  const NAME_ITEM_IDS_MAP = new Map<string, number[]>([
    ["Crystalline Cyst Dust", [113003]],
    ["Damaged Mask", [112005]],
    ["Divining Scroll", [113101]],
    ["Dormant Fungal Nucleus", [113005]],
    ["Forbidden Curse Scroll", [113103]],
    ["Fungal Spores", [113001]],
    ["Inactivated Fungal Nucleus", [113004]],
    ["Luminescent Pollen", [113002]],
    ["Ominous Mask", [112007]],
    ["Robust Fungal Nucleus", [113006]],
    ["Sealed Scroll", [113102]],
    ["Stained Mask", [112006]],
  ]);

  const hilichurlFighter = { enemyType: EnemyType.Common, id: EnemyKindId.HilichurlFighter, nameTextId: "1" };
  const floatingAnemoFungus = { enemyType: EnemyType.Common, id: EnemyKindId.FloatingAnemoFungus, nameTextId: "2" };
  const dendroSamachurl = { enemyType: EnemyType.Common, id: EnemyKindId.DendroSamachurl, nameTextId: "3" };
  const erodingAvatarOfLava = { enemyType: EnemyType.Common, id: EnemyKindId.ErodingAvatarOfLava, nameTextId: "4" };
  const anemoHypostasis = { enemyType: EnemyType.Boss, id: EnemyKindId.AnemoHypostasis, nameTextId: "5" };
  const hilichurlShooter = { enemyType: EnemyType.Common, id: EnemyKindId.HilichurlShooter, nameTextId: "6" };

  const HILICHURLS_ROW = {
    family: "Hilichurls",
    materials: [
      { expectedCount: 0.4202, itemId: 112005, tier: 0 },
      { expectedCount: 0.112, itemId: 112006, tier: 1 },
      { expectedCount: 0.028, itemId: 112007, tier: 2 },
    ],
    mora: 32,
  };
  const FUNGI_SMALL_ROW = {
    family: "Fungi (Small)",
    materials: [
      { expectedCount: 0.8484, itemId: 113001, tier: 0 },
      { expectedCount: 0.2241, itemId: 113002, tier: 1 },
      { expectedCount: 0.056, itemId: 113003, tier: 2 },
    ],
    mora: 32,
  };
  const SAMACHURLS_ROW = {
    family: "Samachurls",
    materials: [
      { expectedCount: 2.5212, itemId: 113101, tier: 0 },
      { expectedCount: 0.6723, itemId: 113102, tier: 1 },
      { expectedCount: 0.168, itemId: 113103, tier: 2 },
      { expectedCount: 0.1681, itemId: 112005, tier: 0 },
      { expectedCount: 0.0448, itemId: 112006, tier: 1 },
      { expectedCount: 0.0112, itemId: 112007, tier: 2 },
    ],
    mora: 32,
  };

  const HILICHURL_FIGHTER_ARTICLE = "==Drops==\n{{Drops Table|type=Hilichurls}}";
  const FLOATING_ANEMO_FUNGUS_ARTICLE =
    "==Drops==\n{{Drops Table|type=Fungi (Small)}}\n{{Drops Table|type=Fungi (Small, Activated)|notice=0}}";
  const DENDRO_SAMACHURL_ARTICLE = "==Drops==\n{{Drops Table|type=Samachurls}}";
  // The article of a kind whose drops come from a Drops template, which names no Drops Table, so the kind is familyless
  const ERODING_AVATAR_OF_LAVA_ARTICLE = "==Drops==\n{{Drops|Avatar of Lava}}";

  let cacheDirectory: string;

  beforeEach(async () => {
    cacheDirectory = await mkdtemp(join(tmpdir(), "enemy-drop-families-"));
    await writeWikiPage(cacheDirectory, DROPS_TABLE_WIKI_MODULE_TITLE, DROPS_MODULE);
  });

  afterEach(async () => {
    await rm(cacheDirectory, { force: true, recursive: true });
  });

  test("a kind takes the drop family its article's Drops Table names, a bounty kind as a placed one does", async () => {
    expect.hasAssertions();
    await writeWikiPage(cacheDirectory, "Hilichurl Fighter", HILICHURL_FIGHTER_ARTICLE);
    await writeWikiPage(cacheDirectory, "Dendro Samachurl", DENDRO_SAMACHURL_ARTICLE);

    expect(
      buildEnemyDropFamilies([hilichurlFighter, dendroSamachurl], ENGLISH_TEXT_MAP, NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toStrictEqual({
      dropFamilies: [HILICHURLS_ROW, SAMACHURLS_ROW],
      dropFamilyKinds: [
        { enemyKindId: EnemyKindId.HilichurlFighter, family: "Hilichurls" },
        { enemyKindId: EnemyKindId.DendroSamachurl, family: "Samachurls" },
      ],
    });
  });

  test("a kind whose article lists two Drops Tables takes the first, as Floating Anemo Fungus does", async () => {
    expect.hasAssertions();
    await writeWikiPage(cacheDirectory, "Floating Anemo Fungus", FLOATING_ANEMO_FUNGUS_ARTICLE);

    expect(
      buildEnemyDropFamilies([floatingAnemoFungus], ENGLISH_TEXT_MAP, NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toStrictEqual({
      dropFamilies: [FUNGI_SMALL_ROW],
      dropFamilyKinds: [{ enemyKindId: EnemyKindId.FloatingAnemoFungus, family: "Fungi (Small)" }],
    });
  });

  test("a boss drops nothing, so its article is not read and it takes no family", () => {
    expect.hasAssertions();

    expect(
      buildEnemyDropFamilies([anemoHypostasis], ENGLISH_TEXT_MAP, NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toStrictEqual({ dropFamilies: [], dropFamilyKinds: [] });
  });

  test("a kind whose article has no Drops Table is familyless only when the familyless list names it", async () => {
    expect.hasAssertions();
    await writeWikiPage(cacheDirectory, "Eroding Avatar of Lava", ERODING_AVATAR_OF_LAVA_ARTICLE);
    await writeWikiPage(cacheDirectory, "Hilichurl Fighter", "==Drops==\n{{Drops|Hilichurl Fighter}}");

    expect(
      buildEnemyDropFamilies([erodingAvatarOfLava], ENGLISH_TEXT_MAP, NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toStrictEqual({ dropFamilies: [], dropFamilyKinds: [] });
    expect(() =>
      buildEnemyDropFamilies([hilichurlFighter], ENGLISH_TEXT_MAP, NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Hilichurl Fighter, has no Drops Table and is on no familyless list]`,
    );
  });

  test("every non-boss kind is given a family or is on the familyless list, and a boss is given none", async () => {
    expect.hasAssertions();
    await writeWikiPage(cacheDirectory, "Hilichurl Fighter", HILICHURL_FIGHTER_ARTICLE);
    await writeWikiPage(cacheDirectory, "Floating Anemo Fungus", FLOATING_ANEMO_FUNGUS_ARTICLE);
    await writeWikiPage(cacheDirectory, "Dendro Samachurl", DENDRO_SAMACHURL_ARTICLE);
    await writeWikiPage(cacheDirectory, "Eroding Avatar of Lava", ERODING_AVATAR_OF_LAVA_ARTICLE);

    expect(
      buildEnemyDropFamilies(
        [hilichurlFighter, floatingAnemoFungus, dendroSamachurl, erodingAvatarOfLava, anemoHypostasis],
        ENGLISH_TEXT_MAP,
        NAME_ITEM_IDS_MAP,
        cacheDirectory,
      ),
    ).toStrictEqual({
      dropFamilies: [FUNGI_SMALL_ROW, HILICHURLS_ROW, SAMACHURLS_ROW],
      dropFamilyKinds: [
        { enemyKindId: EnemyKindId.HilichurlFighter, family: "Hilichurls" },
        { enemyKindId: EnemyKindId.DendroSamachurl, family: "Samachurls" },
        { enemyKindId: EnemyKindId.FloatingAnemoFungus, family: "Fungi (Small)" },
      ],
    });
  });

  test("a family with a material the wiki gives a fixed count is refused rather than dropped without it", async () => {
    expect.hasAssertions();
    await writeWikiPage(
      cacheDirectory,
      "Hilichurl Shooter",
      "==Drops==\n{{Drops Table|type=Sumpter Beast (Hilichurls)}}",
    );

    expect(() =>
      buildEnemyDropFamilies([hilichurlShooter], ENGLISH_TEXT_MAP, NAME_ITEM_IDS_MAP, cacheDirectory),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Sumpter Beast (Hilichurls), has a material of a fixed count, which no drop table models]`,
    );
  });
});
