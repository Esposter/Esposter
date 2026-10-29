import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { HIT_RECORD, RECORD, SOURCE_CANDIDATE_MAP } from "#src/services/genshinAssets/kits/constants.test";
import { compareKitRecord } from "#src/services/genshinAssets/kits/record/compareKitRecord";
import { KitPlunge } from "genshin-world";
import { assert, describe, expect, test } from "vitest";

describe(compareKitRecord, () => {
  const tables = { talentGroupIdMap: {}, talentMultiplierMap: {} } as KitTables;
  const PLUNGE_HITMARK_PATH = "plunges.low.hits.0.hitmarkFrames";
  const WIKI_HITMARK_FRAMES = 10;

  test("leaves no entry for a path only the source gives, so the publish adds it rather than removing it", () => {
    expect.hasAssertions();

    const publishedRecord = {} as KitRecord;
    const sourceCandidateMap = new Map<string, KitCandidate[]>([
      ["parameters.lumiDuration", [{ provenance: { file: "linnea.go", line: 12, source: KitSource.Gcsim }, value: 5 }]],
    ]);

    const { overlay } = compareKitRecord(
      publishedRecord,
      sourceCandidateMap,
      new Map(),
      false,
      {},
      new Map(),
      new Map(),
      tables,
    );

    expect(overlay).toStrictEqual({});
  });

  test("keeps a committed value that neither the record nor a source gives, so the overlay the build reads holds it", () => {
    expect.hasAssertions();

    const committedOverlay = {
      "burstVariant.hits.0.poiseDamage": { cause: KitProvisionalCause.Unsourced, value: 150 },
    };

    const { overlay } = compareKitRecord(
      {} as KitRecord,
      new Map(),
      new Map(),
      false,
      committedOverlay,
      new Map(),
      new Map(),
      tables,
    );

    expect(overlay["burstVariant.hits.0.poiseDamage"]).toStrictEqual(
      committedOverlay["burstVariant.hits.0.poiseDamage"],
    );
  });

  test("reports a borrowed path its donor lacks as this kit's failure, not a throw", () => {
    expect.hasAssertions();

    const committedOverlay = {
      "burstVariant.hits.0.poiseDamage": {
        cause: KitProvisionalCause.BorrowedFromDonor,
        donor: { characterId: 1, path: "burstVariant.hits.0.poiseDamage" },
      },
    };

    expect(
      compareKitRecord(
        {} as KitRecord,
        new Map(),
        new Map(),
        false,
        committedOverlay,
        new Map([[1, {}]]),
        new Map(),
        tables,
      ),
    ).toStrictEqual({ failures: [expect.stringContaining("which character 1 lacks")], overlay: {} });
  });

  test("leaves no entry for a plunge path its donor stands in at, so the wiki value the build reads is reported", () => {
    expect.hasAssertions();

    const sourceCandidateMap = new Map<string, KitCandidate[]>([
      ...SOURCE_CANDIDATE_MAP,
      [
        PLUNGE_HITMARK_PATH,
        [
          { provenance: { page: "Kit", revisionId: 1, row: 1, source: KitSource.Wiki }, value: WIKI_HITMARK_FRAMES },
          {
            provenance: { cause: KitProvisionalCause.NoActionFile, file: "kit.go", line: 1, source: KitSource.Gcsim },
            value: HIT_RECORD.hitmarkFrames,
          },
        ],
      ],
    ]);

    const { built, ...comparison } = compareKitRecord(
      RECORD,
      sourceCandidateMap,
      new Map(),
      false,
      {},
      new Map(),
      new Map(),
      tables,
    );

    expect(comparison).toStrictEqual({ failures: [PLUNGE_HITMARK_PATH], overlay: {} });
    assert.exists(built);
    expect(built.record.plunges[KitPlunge.Low].hits).toStrictEqual([
      { ...HIT_RECORD, hitmarkFrames: WIKI_HITMARK_FRAMES },
    ]);
  });
});
