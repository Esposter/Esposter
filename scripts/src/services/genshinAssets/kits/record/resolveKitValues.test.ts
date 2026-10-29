import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCall } from "#src/models/genshinAssets/kits/NamedHitCall";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { CombatTalent, Element } from "genshin-world";
import { describe, expect, test } from "vitest";

// A call the fiery rain arrows' talent variable makes, landing at the delay and giving it as its hitmark
const call = (delay: number): NamedHitCall => ({
  delay,
  fieldMap: new Map([
    ["hitmarkFrames", [{ provenance: { file: "burst.go", line: delay, source: KitSource.Gcsim }, value: delay }]],
  ]),
  file: "burst.go",
  line: 5,
  site: "burst.go:4",
});

describe(resolveKitValues, () => {
  const TABLES = { element: Element.Geo, talentGroupIdMap: {} } as KitTables;
  const OVERLAY: KitOverlay = { "burst.hits.0.element": { cause: KitProvisionalCause.NoGcsimUnit, value: "Rock" } };

  const tables = {
    talentGroupIdMap: { [CombatTalent.ElementalBurst]: 2139, [CombatTalent.ElementalSkill]: 2138 },
    talentMultiplierMap: {},
  } as KitTables;

  const sourceCandidateMap = new Map<string, KitCandidate[]>([
    ["burst.hits.length", [{ provenance: { file: "burst.go", line: 60, source: KitSource.Gcsim }, value: 3 }]],
    [
      "hits.fieryRainArrows.0.multiplier",
      [
        {
          provenance: { index: 0, label: " ", proudSkillGroupId: 2139, source: KitSource.Tables },
          value: { index: 0, proudSkillGroupId: 2139 },
        },
      ],
    ],
  ]);

  const namedHitCandidateMap: NamedHitCandidateMap = new Map([
    ["2139|0", { fieldMap: new Map(), queuedCalls: [call(10), call(30)] }],
  ]);

  test("names an overlay value no gcsim folder gives as the unit gcsim does not model", () => {
    expect.hasAssertions();

    const { provenanceMap } = resolveKitValues(new Map(), OVERLAY, new Map(), new Map(), TABLES, false);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      cause: KitProvisionalCause.NoGcsimUnit,
      source: KitSource.Overlay,
    });
  });

  test("refuses that cause for a character gcsim has a folder for, which can read the value", () => {
    expect.hasAssertions();

    expect(() =>
      resolveKitValues(new Map(), OVERLAY, new Map(), new Map(), TABLES, true),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: burst.hits.0.element, names NoGcsimUnit, but gcsim has a folder for the character]`,
    );
  });

  test("refuses an Unsourced value a gcsim candidate gives at its path, naming gcsim", () => {
    expect.hasAssertions();

    expect(() =>
      resolveKitValues(
        sourceCandidateMap,
        { "burst.hits.length": { cause: KitProvisionalCause.Unsourced, value: 2 } },
        new Map(),
        new Map(),
        TABLES,
        false,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: burst.hits.length, names Unsourced, but Gcsim gives 3]`,
    );
  });

  test("refuses a DiffersFromSource value a gcsim candidate gives at its path, which a choice of gcsim names", () => {
    expect.hasAssertions();

    expect(() =>
      resolveKitValues(
        sourceCandidateMap,
        { "burst.hits.length": { cause: KitProvisionalCause.DiffersFromSource, value: 3 } },
        new Map(),
        new Map(),
        TABLES,
        false,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: burst.hits.length, names DiffersFromSource, but Gcsim gives 3]`,
    );
  });

  test("keeps a DiffersFromSource reference that reads the same numbers as a source's reference to another group", () => {
    expect.hasAssertions();

    const sameRowTables: KitTables = {
      ...tables,
      talentMultiplierMap: { "2138": [{ level: 1, paramList: [2.456] }], "2139": [{ level: 1, paramList: [2.456] }] },
    };
    const { valueMap } = resolveKitValues(
      sourceCandidateMap,
      {
        "hits.fieryRainArrows.0.multiplier": {
          cause: KitProvisionalCause.DiffersFromSource,
          value: { index: 0, proudSkillGroupId: 2138 },
        },
      },
      new Map(),
      new Map(),
      sameRowTables,
      false,
    );

    expect(valueMap.get("hits.fieryRainArrows.0.multiplier")).toStrictEqual({ index: 0, proudSkillGroupId: 2138 });
  });

  test("refuses a NoPoiseSource value the wiki gives at its path, naming the wiki", () => {
    expect.hasAssertions();

    expect(() =>
      resolveKitValues(
        new Map([
          [
            "burst.hits.0.poiseDamage",
            [{ provenance: { page: "Dough-Fu", revisionId: 1, row: 1, source: KitSource.Wiki }, value: 50 }],
          ],
        ]),
        { "burst.hits.0.poiseDamage": { cause: KitProvisionalCause.NoPoiseSource, value: 0 } },
        new Map(),
        new Map(),
        TABLES,
        false,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: burst.hits.0.poiseDamage, names NoPoiseSource, but Wiki gives 50]`,
    );
  });

  test("keeps an Unsourced value over a rule's candidate, which is not a source at its path", () => {
    expect.hasAssertions();

    const { provenanceMap, valueMap } = resolveKitValues(
      new Map([
        [
          "burst.hits.0.poiseDamage",
          [
            {
              provenance: {
                cause: KitProvisionalCause.NoPoiseSource,
                rule: KitRule.NoPoiseSource,
                source: KitSource.Rule,
              },
              value: 0,
            },
          ],
        ],
      ]),
      { "burst.hits.0.poiseDamage": { cause: KitProvisionalCause.Unsourced, value: 2 } },
      new Map(),
      new Map(),
      TABLES,
      false,
    );

    expect(valueMap.get("burst.hits.0.poiseDamage")).toBe(2);
    expect(provenanceMap.get("burst.hits.0.poiseDamage")).toStrictEqual({
      cause: KitProvisionalCause.Unsourced,
      source: KitSource.Overlay,
    });
  });

  test("gives a burst's first hit the character's element where no source gives one, as a rule", () => {
    expect.hasAssertions();

    const { provenanceMap, valueMap } = resolveKitValues(
      new Map(),
      { "burst.hits.length": { cause: KitProvisionalCause.NoGcsimUnit, value: 1 } },
      new Map(),
      new Map(),
      TABLES,
      false,
    );
    expect(valueMap.get("burst.hits.0.element")).toBe(Element.Geo);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      rule: KitRule.EnergyElement,
      source: KitSource.Rule,
    });
  });

  test("empties the burst's hits list when a named list's hit joins to the burst's group through a Tables multiplier", () => {
    expect.hasAssertions();

    const { provenanceMap, valueMap } = resolveKitValues(sourceCandidateMap, {}, new Map(), new Map(), tables, false);

    expect(valueMap.get("burst.hits.length")).toBe(0);
    expect(provenanceMap.get("burst.hits.length")).toStrictEqual({
      cause: KitProvisionalCause.NamedHitList,
      rule: KitRule.NamedHitList,
      source: KitSource.Rule,
    });
  });

  test("takes a chosen gcsim hitmark from the call of the hit's attack that lands at it", () => {
    expect.hasAssertions();

    const { provenanceMap, valueMap } = resolveKitValues(
      sourceCandidateMap,
      { "hits.fieryRainArrows.0.hitmarkFrames": { source: KitSource.Gcsim, value: 30 } },
      new Map(),
      namedHitCandidateMap,
      tables,
      false,
    );

    expect(valueMap.get("hits.fieryRainArrows.0.hitmarkFrames")).toBe(30);
    expect(provenanceMap.get("hits.fieryRainArrows.0.hitmarkFrames")).toStrictEqual({
      file: "burst.go",
      line: 30,
      source: KitSource.Gcsim,
    });
  });

  test("refuses a chosen gcsim hitmark no call of the hit's attack lands at", () => {
    expect.hasAssertions();

    expect(() =>
      resolveKitValues(
        sourceCandidateMap,
        { "hits.fieryRainArrows.0.hitmarkFrames": { source: KitSource.Gcsim, value: 20 } },
        new Map(),
        namedHitCandidateMap,
        tables,
        false,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: hits.fieryRainArrows.0.hitmarkFrames, has no Gcsim value for the overlay to choose]`,
    );
  });

  test("keeps the overlay's own length over the named list's", () => {
    expect.hasAssertions();

    const { valueMap } = resolveKitValues(
      sourceCandidateMap,
      { "burst.hits.length": { cause: KitProvisionalCause.Unclassified, value: 2 } },
      new Map(),
      new Map(),
      tables,
      false,
    );

    expect(valueMap.get("burst.hits.length")).toBe(2);
  });
});
