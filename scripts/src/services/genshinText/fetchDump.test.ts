import {
  BIN_OUTPUT_DIRECTORY,
  GAME_TEXT_DIRECTORY,
  MAIN_QUEST_TABLE_NAME,
  QUEST_BINARY_DIRECTORY_PATH,
} from "#src/services/genshinText/constants";
import { fetchDump } from "#src/services/genshinText/fetchDump";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { fetchJson } from "#src/services/shared/fetchJson";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("genshin-world"), async (importOriginal) => ({
  ...(await importOriginal()),
  QuestIds: ["311"],
  ReputationRequestQuestIds: [],
}));
vi.mock(import("#src/services/genshinText/readExcelTable"));
vi.mock(import("#src/services/shared/fetchJson"));
vi.mock(import("#src/services/shared/fetchOk"));
vi.mock(import("#src/services/shared/publishFile"));
vi.mock(import("node:fs"), async (importOriginal) => ({
  ...(await importOriginal()),
  existsSync: vi.fn(() => true),
  readdirSync: vi.fn(() => [
    { isFile: () => true, name: "311.json", parentPath: join(GAME_TEXT_DIRECTORY, BIN_OUTPUT_DIRECTORY, "Quest") },
  ]),
  statSync: vi.fn(() => ({ size: 100 })),
}));

describe(fetchDump, () => {
  test("a carried quest binary the dump already holds is counted once, as held", async () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockImplementation((tableName) =>
      tableName === MAIN_QUEST_TABLE_NAME ? [{ id: 311 }] : [],
    );
    vi.mocked(fetchJson).mockImplementation(async (url) => ({
      tree: url.endsWith(`:${QUEST_BINARY_DIRECTORY_PATH}`) ? [{ path: "311.json", size: 100, type: "blob" }] : [],
      truncated: false,
    }));

    expect(await fetchDump()).toStrictEqual(["0 dump files fetched, 1 already held"]);
  });
});
