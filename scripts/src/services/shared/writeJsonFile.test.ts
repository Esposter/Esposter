import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeJsonFile, () => {
  const SET = { id: 10001, nameTextId: "2364208339", needCounts: [2, 4], pieceItemIds: [51140, 51120] };
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "write-json-file-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("writes the formatter's form rather than JSON.stringify's", () => {
    expect.hasAssertions();

    const path = join(directory, "sets.json");
    writeJsonFile(path, [SET]);

    expect(readFileSync(path, "utf8")).toBe(
      '[{ "id": 10001, "nameTextId": "2364208339", "needCounts": [2, 4], "pieceItemIds": [51140, 51120] }]\n',
    );
  });

  test("a second write of the same data leaves the file byte-identical", () => {
    expect.hasAssertions();

    const path = join(directory, "nested", "sets.json");
    writeJsonFile(path, [SET]);
    const firstContent = readFileSync(path, "utf8");
    writeJsonFile(path, [SET]);

    expect(readFileSync(path, "utf8")).toBe(firstContent);
  });
});
