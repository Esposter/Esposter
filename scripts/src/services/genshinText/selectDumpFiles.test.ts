import type { DumpFile } from "#src/models/genshinText/DumpFile";

import { selectDumpFiles } from "#src/services/genshinText/selectDumpFiles";
import { describe, expect, test } from "vitest";

describe(selectDumpFiles, () => {
  const HELD_PATH = "Readable/EN/held.txt";
  const CHANGED_PATH = "Readable/EN/changed.txt";
  const MISSING_PATH = "Readable/EN/missing.txt";
  const SHA = "a";
  const remoteFiles: DumpFile[] = [
    { path: HELD_PATH, sha: SHA },
    { path: CHANGED_PATH, sha: SHA },
    { path: MISSING_PATH, sha: SHA },
  ];

  test("keeps a file held with the remote's content and selects the one held with other content or not held", () => {
    expect.hasAssertions();

    expect(
      selectDumpFiles(
        remoteFiles,
        new Map([
          [HELD_PATH, SHA],
          [CHANGED_PATH, "b"],
        ]),
      ),
    ).toStrictEqual([
      { path: CHANGED_PATH, sha: SHA },
      { path: MISSING_PATH, sha: SHA },
    ]);
  });
});
