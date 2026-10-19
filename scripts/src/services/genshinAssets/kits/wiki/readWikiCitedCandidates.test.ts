import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { readWikiCitedCandidates } from "#src/services/genshinAssets/kits/wiki/readWikiCitedCandidates";
import { CombatTalent } from "genshin-world";
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
