import {
  ANIME_GAME_DATA_COMMIT,
  ANIME_GAME_DATA_TREES_URL,
  QUEST_BINARY_DIRECTORY_PATH,
} from "#src/services/genshinText/constants";
import { listRemoteDirectory } from "#src/services/genshinText/listRemoteDirectory";
import { fetchJson } from "#src/services/shared/fetchJson";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/fetchJson"));

describe(listRemoteDirectory, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  test("A fetched source is pinned to a commit", async () => {
    expect.hasAssertions();

    // An empty token is no token, so the listing's headers are absent and the call's arguments are the URL alone
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.mocked(fetchJson).mockResolvedValueOnce({ tree: [], truncated: false });

    await listRemoteDirectory(QUEST_BINARY_DIRECTORY_PATH);

    expect(vi.mocked(fetchJson)).toHaveBeenCalledExactlyOnceWith(
      `${ANIME_GAME_DATA_TREES_URL}/${ANIME_GAME_DATA_COMMIT}:${QUEST_BINARY_DIRECTORY_PATH}`,
      undefined,
    );
  });
});
