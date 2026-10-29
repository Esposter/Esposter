import type { Dirent, readdirSync, readFileSync } from "node:fs";

import {
  BIN_OUTPUT_DIRECTORY,
  GAME_TEXT_DIRECTORY,
  MAIN_QUEST_TABLE_NAME,
  QUEST_BINARY_DIRECTORY_PATH,
} from "#src/services/genshinText/constants";
import { fetchDump } from "#src/services/genshinText/fetchDump";
import { getGitBlobSha } from "#src/services/genshinText/getGitBlobSha";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { fetchJson } from "#src/services/shared/fetchJson";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

const { CONTENT } = vi.hoisted(() => ({ CONTENT: "a" }));

vi.mock(import("genshin-world"), async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, QuestIds: [original.QuestId.BirdsEyeView], ReputationRequestQuestIds: [] };
});
vi.mock(import("#src/services/genshinText/readExcelTable"));
vi.mock(import("#src/services/shared/fetchJson"));
vi.mock(import("#src/services/shared/fetchOk"));
vi.mock(import("#src/services/shared/publishFile"));
vi.mock(import("node:fs"), async (importOriginal) => ({
  ...(await importOriginal()),
  existsSync: vi.fn<() => boolean>(() => true),
  readdirSync: vi.fn<() => Dirent[]>(() => [
    {
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isDirectory: () => false,
      isFIFO: () => false,
      isFile: () => true,
      isSocket: () => false,
      isSymbolicLink: () => false,
      name: "352.json",
      parentPath: join(GAME_TEXT_DIRECTORY, BIN_OUTPUT_DIRECTORY, "Quest"),
    } satisfies Dirent,
  ]) as unknown as typeof readdirSync,
  readFileSync: vi.fn<() => Buffer>(() => Buffer.from(CONTENT)) as unknown as typeof readFileSync,
}));

describe(fetchDump, () => {
  test("a carried quest binary the dump already holds is counted once, as held", async () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockImplementation((tableName) =>
      tableName === MAIN_QUEST_TABLE_NAME ? [{ id: 352 }] : [],
    );
    vi.mocked(fetchJson).mockImplementation((url) =>
      Promise.resolve({
        tree: url.endsWith(`:${QUEST_BINARY_DIRECTORY_PATH}`)
          ? [{ path: "352.json", sha: getGitBlobSha(Buffer.from(CONTENT)), type: "blob" }]
          : [],
        truncated: false,
      }),
    );

    await expect(fetchDump()).resolves.toStrictEqual(["0 dump files fetched, 1 already held"]);
  });
});
