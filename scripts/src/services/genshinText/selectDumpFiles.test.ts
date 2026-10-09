import type { DumpFile } from "#src/models/genshinText/DumpFile";

import { selectDumpFiles } from "#src/services/genshinText/selectDumpFiles";
import { describe, expect, test } from "vitest";

describe(selectDumpFiles, () => {
  const HELD_PATH = "Readable/EN/held.txt";
  const RESIZED_PATH = "Readable/EN/resized.txt";
  const MISSING_PATH = "Readable/EN/missing.txt";
  const SIZE = 3;
  const remoteFiles: DumpFile[] = [
    { path: HELD_PATH, size: SIZE },
    { path: RESIZED_PATH, size: SIZE },
    { path: MISSING_PATH, size: SIZE },
  ];

  test("keeps a file held at its size and selects the one held at another size or not held", () => {
    expect.hasAssertions();

    expect(
      selectDumpFiles(
        remoteFiles,
        new Map([
          [HELD_PATH, SIZE],
          [RESIZED_PATH, SIZE + 1],
        ]),
      ),
    ).toStrictEqual([
      { path: RESIZED_PATH, size: SIZE },
      { path: MISSING_PATH, size: SIZE },
    ]);
  });
});
