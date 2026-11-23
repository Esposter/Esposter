import {
  ANIME_GAME_DATA_URL,
  DUMP_FILE_DOWNLOAD_TIMEOUT_MS,
  DUMP_FILE_MAX_BYTES,
  QUEST_BINARY_DIRECTORY_PATH,
} from "#src/services/genshinText/constants";
import { downloadDumpFile } from "#src/services/genshinText/downloadDumpFile";
import { fetchOk } from "#src/services/shared/fetchOk";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/fetchOk"));
vi.mock(import("#src/services/shared/publishFile"));

describe(downloadDumpFile, () => {
  const fileName = "352.json";
  const fileSha = "a".repeat(40);

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("a fetched source is pinned to a commit", async () => {
    expect.hasAssertions();

    vi.mocked(fetchOk).mockResolvedValueOnce(new Uint8Array());

    await downloadDumpFile({ path: `${QUEST_BINARY_DIRECTORY_PATH}/${fileName}`, sha: fileSha });

    expect(vi.mocked(fetchOk)).toHaveBeenCalledExactlyOnceWith(
      `${ANIME_GAME_DATA_URL}/${QUEST_BINARY_DIRECTORY_PATH}/${fileName}`,
      { maxBytes: DUMP_FILE_MAX_BYTES, timeoutMs: DUMP_FILE_DOWNLOAD_TIMEOUT_MS },
    );
  });
});
