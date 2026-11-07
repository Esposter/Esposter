import {
  GCSIM_CHARACTERS_PATH,
  GCSIM_CONFIG_FILE,
  GCSIM_MAIN_COMMIT,
  GCSIM_RAW_URL,
} from "#src/services/genshinAssets/kits/constants";
import { readGcsimMainCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimMainCharacters";
import { fetchOk } from "#src/services/shared/fetchOk";
import { runGh } from "#src/services/shared/runGh";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/kits/gcsim/readGcsimCharacter"));
vi.mock(import("#src/services/shared/fetchOk"));
vi.mock(import("#src/services/shared/runGh"));

describe(readGcsimMainCharacters, () => {
  const folder = "albedo";
  const configPath = `${GCSIM_CHARACTERS_PATH}/${folder}/${GCSIM_CONFIG_FILE}`;

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("A fetched source is pinned to a commit", async () => {
    expect.hasAssertions();

    vi.mocked(runGh).mockReturnValueOnce(JSON.stringify({ tree: [{ path: configPath, type: "blob" }] }));
    vi.mocked(fetchOk).mockResolvedValueOnce(new Response(""));

    await readGcsimMainCharacters([folder]);

    expect(vi.mocked(runGh)).toHaveBeenCalledExactlyOnceWith([
      "api",
      expect.stringContaining(`git/trees/${GCSIM_MAIN_COMMIT}?recursive=1`),
    ]);
    expect(vi.mocked(fetchOk)).toHaveBeenCalledExactlyOnceWith(`${GCSIM_RAW_URL}/${GCSIM_MAIN_COMMIT}/${configPath}`);
  });
});
