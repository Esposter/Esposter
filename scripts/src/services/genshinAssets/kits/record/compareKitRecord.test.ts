import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { compareKitRecord } from "#src/services/genshinAssets/kits/record/compareKitRecord";
import { describe, expect, test } from "vitest";

const talentGroupIdMap = {} as unknown as KitTables["talentGroupIdMap"];

describe(compareKitRecord, () => {
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
      talentGroupIdMap,
    );

    expect(overlay).toStrictEqual({});
  });
});
