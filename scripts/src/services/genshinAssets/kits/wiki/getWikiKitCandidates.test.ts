import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { WIKI_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/wiki/constants.test";
import { getWikiKitCandidates } from "#src/services/genshinAssets/kits/wiki/getWikiKitCandidates";
import { parseAdvancedProperties } from "#src/services/genshinAssets/kits/wiki/parseAdvancedProperties";
import { CombatTalent, InternalCooldownTag, KitPlunge, WeaponType } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readPage = (title: string, combatTalent: CombatTalent, revisionId: number): WikiTalentPage => ({
  combatTalent,
  properties: parseAdvancedProperties(readFileSync(join(WIKI_FIXTURE_DIRECTORY, `${title}.wikitext`), "utf8")),
  revisionId,
  title,
});
// A row's values by their paths, as a strike's or a hit the wiki gives no ICD tag writes them
const createStrikeEntries = (
  path: string,
  poise: number,
  internalCooldownTag = InternalCooldownTag.NormalAttack,
): [string, unknown][] => [
  [`${path}.poiseDamage`, poise],
  [`${path}.internalCooldownTag`, internalCooldownTag],
];
const createUntaggedEntries = (path: string, poise: number, gauge?: number): [string, unknown][] => [
  [`${path}.poiseDamage`, poise],
  [`${path}.internalCooldownTag`, undefined],
  ...(gauge === undefined ? [] : [[`${path}.gauge`, gauge] satisfies [string, unknown]]),
];

describe(getWikiKitCandidates, () => {
  test("joins Xiangling's rows by their titles, the skill's and burst's by the words their table labels share", () => {
    expect.hasAssertions();

    const doughFu = readPage("Dough-Fu", CombatTalent.NormalAttack, 1677053);
    const pyronado = readPage("Pyronado", CombatTalent.ElementalBurst, 2066383);
    const candidateMap = getWikiKitCandidates(
      [doughFu, pyronado],
      { weaponType: WeaponType.Polearm },
      new Map([
        ["burst.hits.0", "1-Hit Swing DMG"],
        ["burst.hits.3", "Pyronado DMG"],
      ]),
    );

    expect(
      Object.fromEntries(
        Array.from(candidateMap, ([path, candidates]) => [path, candidates.map(({ value }) => value)]),
      ),
    ).toStrictEqual(
      Object.fromEntries(
        [
          ...createStrikeEntries("normalAttacks.0.hits.0", 16),
          ...createStrikeEntries("normalAttacks.1.hits.0", 19.2),
          ...createStrikeEntries("normalAttacks.2.hits.0", 19.2),
          ...createStrikeEntries("normalAttacks.2.hits.1", 20),
          ...createStrikeEntries("normalAttacks.3.hits.0", 19.2),
          ...createStrikeEntries("normalAttacks.3.hits.1", 19.2),
          ...createStrikeEntries("normalAttacks.3.hits.2", 19.2),
          ...createStrikeEntries("normalAttacks.3.hits.3", 12.8),
          ...createStrikeEntries("normalAttacks.4.hits.0", 71.2),
          ...createStrikeEntries("chargedAttack.hits.0", 120, InternalCooldownTag.ChargedAttack),
          ...createUntaggedEntries("plungeCollision", 25, 0),
          ...createUntaggedEntries(`plunges.${KitPlunge.Low}.hits.0`, 100),
          ...createUntaggedEntries(`plunges.${KitPlunge.High}.hits.0`, 150),
          ...createStrikeEntries("burst.hits.0", 30, InternalCooldownTag.ElementalBurst),
          ["burst.hits.0.gauge", 1],
          ...createUntaggedEntries("burst.hits.3", 30, 1),
        ].map(([path, value]) => [path, [value]]),
      ),
    );
    expect(candidateMap.get("burst.hits.3.poiseDamage")?.[0]?.provenance).toStrictEqual({
      page: "Pyronado",
      revisionId: 2066383,
      row: 2,
      source: KitSource.Wiki,
    });
  });
});
