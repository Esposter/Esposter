import { mergeAssetMapLines } from "#src/services/genshinAssets/blocks/mergeAssetMapLines";
import { Readable } from "node:stream";
import { describe, expect, test } from "vitest";

// An asset map's lines as AnimeStudio writes them: one entry for each name, its source under the shard's root, and its
// Closing brace carrying a comma on every entry but the shard's last
const createEntry = (name: string, source: string, closing: string): string[] => [
  "    {",
  `      "Name": "${name}",`,
  `      "Source": "${source}",`,
  '      "PathID": 1',
  closing,
];
const createShard = (entries: string[][]): string[] => [
  "{",
  '  "GameType": "GI",',
  '  "AssetEntries": [',
  ...entries.flat(),
  "  ]",
  "}",
];
const merge = async (shards: { lines: string[]; root: string }[], gameRoot: string): Promise<string[]> => {
  const merged: string[] = [];
  for await (const line of mergeAssetMapLines(
    shards.map(({ lines, root }) => ({ lines: Readable.from(lines), root })),
    gameRoot,
  ))
    merged.push(line);
  return merged;
};

describe(mergeAssetMapLines, () => {
  test("joins the shards' entries under the first header, each source rebased to the game's blocks", async () => {
    expect.hasAssertions();

    const merged = await merge(
      [
        {
          lines: createShard([
            createEntry("a", "/shards/0/blocks/00/1.blk", "    },"),
            createEntry("b", "/shards/0/blocks/00/1.blk", "    }"),
          ]),
          root: "/shards/0/blocks",
        },
        { lines: createShard([createEntry("c", "/shards/1/blocks/01/2.blk", "    }")]), root: "/shards/1/blocks" },
      ],
      "/game/blocks",
    );

    expect(merged).toStrictEqual([
      "{",
      '  "GameType": "GI",',
      '  "AssetEntries": [',
      ...createEntry("a", "/game/blocks/00/1.blk", "    },"),
      ...createEntry("b", "/game/blocks/00/1.blk", "    },"),
      ...createEntry("c", "/game/blocks/01/2.blk", "    }"),
      "  ]",
      "}",
    ]);
  });

  test("refuses a source outside its shard's blocks, which the index would read as another block", async () => {
    expect.hasAssertions();

    await expect(
      merge(
        [{ lines: createShard([createEntry("a", "/elsewhere/00/1.blk", "    }")]), root: "/shards/0/blocks" }],
        "/game/blocks",
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: /shards/0/blocks, holds a source outside it: "Source": "/elsewhere/00/1.blk",]`,
    );
  });
});
