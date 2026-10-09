import { parseKeyFilePaths } from "#src/services/fleet/parseKeyFilePaths";
import { describe, expect, test } from "vitest";

describe(parseKeyFilePaths, () => {
  const PROPOSAL = [
    "---",
    "title: Archive",
    "---",
    "",
    "Lead paragraph with `packages/not-a-key-file.ts` in prose.",
    "",
    "## Shape",
    "",
    "| `packages/elsewhere.ts` | a table outside the key files |",
    "",
    "## Key files",
    "",
    "| File | Role |",
    "| --- | --- |",
    "| `packages/genshin-world/src/services/archive/openArchiveBook.ts` | opens a book |",
    "| `scripts/src/services/genshinAssets/archive/writeArchive.ts` | writes it |",
    "",
    "## Next",
  ].join("\n");

  test("reads the path each row of the Key files table opens on", () => {
    expect.hasAssertions();

    expect(parseKeyFilePaths(PROPOSAL)).toStrictEqual([
      "packages/genshin-world/src/services/archive/openArchiveBook.ts",
      "scripts/src/services/genshinAssets/archive/writeArchive.ts",
    ]);
  });

  test("reads a proposal without a Key files table as touching nothing", () => {
    expect.hasAssertions();

    expect(parseKeyFilePaths("## Shape\n\n| `a.ts` | x |")).toStrictEqual([]);
  });
});
