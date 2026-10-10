import type { CabMapRecord } from "#src/models/genshinAssets/shared/CabMapRecord";

import { mergeCabMaps } from "#src/services/genshinAssets/blocks/mergeCabMaps";
import { readCabMap } from "#src/services/genshinAssets/shared/readCabMap";
import { writeCabMap } from "#src/services/genshinAssets/shared/writeCabMap";
import { describe, expect, test } from "vitest";

const writeRecords = (baseFolder: string, records: CabMapRecord[]): Buffer => writeCabMap({ baseFolder, records });

describe(mergeCabMaps, () => {
  test("keeps the first map's record of a name both hold, in name order, under the one base folder", () => {
    expect.hasAssertions();

    const first = writeRecords("shard-a", [
      { block: "00/b.blk", dependencies: ["cab-c"], name: "CAB-b", offset: 8 },
      { block: "00/a.blk", dependencies: [], name: "CAB-a", offset: 0 },
    ]);
    const second = writeRecords("shard-b", [
      { block: "01/duplicate.blk", dependencies: [], name: "cab-a", offset: 24 },
      { block: "01/c.blk", dependencies: ["CAB-b"], name: "CAB-c", offset: 0 },
    ]);

    expect(readCabMap(mergeCabMaps([first, second], "root"))).toStrictEqual({
      baseFolder: "root",
      records: [
        { block: "00/a.blk", dependencies: [], name: "CAB-a", offset: 0 },
        { block: "00/b.blk", dependencies: ["cab-c"], name: "CAB-b", offset: 8 },
        { block: "01/c.blk", dependencies: ["CAB-b"], name: "CAB-c", offset: 0 },
      ],
    });
  });
});
