import { writeMergedAssetMap } from "#src/services/genshinAssets/blocks/writeMergedAssetMap";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// A shard's asset map as AnimeStudio writes it, one entry naming the block its source is under the shard's root
const createShardText = (root: string, name: string): string =>
  [
    "{",
    '  "GameType": "GI",',
    '  "AssetEntries": [',
    "    {",
    `      "Name": "${name}",`,
    `      "Source": "${root}/00/1.blk",`,
    '      "PathID": 1',
    "    }",
    "  ]",
    "}",
    "",
  ].join("\n");

describe(writeMergedAssetMap, () => {
  let directory: string;

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "asset-map-"));
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("merges shard files that are each read when the merge reaches it, not before", async () => {
    expect.hasAssertions();

    const [first, second] = [join(directory, "first.json"), join(directory, "second.json")];
    writeFileSync(first, createShardText(join(directory, "first-blocks"), "a"));
    writeFileSync(second, createShardText(join(directory, "second-blocks"), "b"));
    const output = join(directory, "merged.json");

    await writeMergedAssetMap(
      [
        { path: first, root: join(directory, "first-blocks") },
        { path: second, root: join(directory, "second-blocks") },
      ],
      "/game/blocks",
      output,
    );

    await expect(readFile(output, "utf8")).resolves.toStrictEqual(
      [
        "{",
        '  "GameType": "GI",',
        '  "AssetEntries": [',
        "    {",
        '      "Name": "a",',
        '      "Source": "/game/blocks/00/1.blk",',
        '      "PathID": 1',
        "    },",
        "    {",
        '      "Name": "b",',
        '      "Source": "/game/blocks/00/1.blk",',
        '      "PathID": 1',
        "    }",
        "  ]",
        "}",
        "",
      ].join("\n"),
    );
  });
});
