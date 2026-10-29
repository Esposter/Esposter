import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";
import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { WIKI_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/wiki/constants.test";
import { parseAdvancedProperties } from "#src/services/genshinAssets/kits/wiki/parseAdvancedProperties";
import { readWikiCitedCandidates } from "#src/services/genshinAssets/kits/wiki/readWikiCitedCandidates";
import { CombatTalent } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readWikiCitedCandidates, () => {
  const lightningRose: WikiTalentPage = {
    combatTalent: CombatTalent.ElementalBurst,
    properties: [{ gauge: 0, internalCooldownTag: "none", poise: 10, row: 1, title: "Activation DMG" }],
    revisionId: 2,
    title: "Lightning Rose",
  };

  test("gives a cited row's poise at the citing path, from the page at its revision", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "burst.hits.0.poiseDamage": { page: "Lightning Rose", row: 1, source: KitSource.Wiki },
    };

    expect(readWikiCitedCandidates(overlay, [lightningRose])).toStrictEqual(
      new Map([
        [
          "burst.hits.0.poiseDamage",
          [{ provenance: { page: "Lightning Rose", revisionId: 2, row: 1, source: KitSource.Wiki }, value: 10 }],
        ],
      ]),
    );
  });

  test("gives each Salon member the poise of the row it cites on the Salon Solitaire page, where gcsim gives none", () => {
    expect.hasAssertions();

    const salonSolitaire: WikiTalentPage = {
      combatTalent: CombatTalent.ElementalSkill,
      properties: parseAdvancedProperties(
        readFileSync(join(WIKI_FIXTURE_DIRECTORY, "Salon Solitaire.wikitext"), "utf8"),
      ),
      revisionId: 2136445,
      title: "Salon Solitaire",
    };
    const overlay: KitOverlay = {
      "hits.salonMemberAttacks.0.poiseDamage": { page: "Salon Solitaire", row: 3, source: KitSource.Wiki },
      "hits.salonMemberAttacks.1.poiseDamage": { page: "Salon Solitaire", row: 2, source: KitSource.Wiki },
      "hits.salonMemberAttacks.2.poiseDamage": { page: "Salon Solitaire", row: 4, source: KitSource.Wiki },
    };

    expect(readWikiCitedCandidates(overlay, [salonSolitaire])).toStrictEqual(
      new Map([
        [
          "hits.salonMemberAttacks.0.poiseDamage",
          [{ provenance: { page: "Salon Solitaire", revisionId: 2136445, row: 3, source: KitSource.Wiki }, value: 10 }],
        ],
        [
          "hits.salonMemberAttacks.1.poiseDamage",
          [{ provenance: { page: "Salon Solitaire", revisionId: 2136445, row: 2, source: KitSource.Wiki }, value: 15 }],
        ],
        [
          "hits.salonMemberAttacks.2.poiseDamage",
          [{ provenance: { page: "Salon Solitaire", revisionId: 2136445, row: 4, source: KitSource.Wiki }, value: 30 }],
        ],
      ]),
    );
  });

  test("throws on a row the cited page lacks", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "burst.hits.0.poiseDamage": { page: "Lightning Rose", row: 2, source: KitSource.Wiki },
    };

    expect(() => readWikiCitedCandidates(overlay, [lightningRose])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: burst.hits.0.poiseDamage, cites row 2 of Lightning Rose, which the page lacks]`,
    );
  });
});
