import {
  GCSIM_CHARACTERS_PATH,
  GCSIM_CONFIG_FILE,
  GCSIM_MAIN_COMMIT,
  GCSIM_RAW_URL,
  GCSIM_TREES_URL,
} from "#src/services/genshinAssets/kits/constants";
import { readGcsimMainCharacters } from "#src/services/genshinAssets/kits/gcsim/readGcsimMainCharacters";
import { fetchJson } from "#src/services/shared/fetchJson";
import { fetchOk } from "#src/services/shared/fetchOk";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/kits/gcsim/readGcsimCharacter"));
vi.mock(import("#src/services/shared/fetchJson"));
vi.mock(import("#src/services/shared/fetchOk"));

describe(readGcsimMainCharacters, () => {
  const folder = "albedo";
  const configPath = `${GCSIM_CHARACTERS_PATH}/${folder}/${GCSIM_CONFIG_FILE}`;

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  test("a fetched source is pinned to a commit", async () => {
    expect.hasAssertions();

    // An empty token is no token, so the listing's headers are absent and the call's arguments are the URL alone
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.mocked(fetchJson).mockResolvedValueOnce({ tree: [{ path: configPath, type: "blob" }], truncated: false });
    vi.mocked(fetchOk).mockResolvedValueOnce(new Response(""));

    await readGcsimMainCharacters([folder]);

    expect(vi.mocked(fetchJson)).toHaveBeenCalledExactlyOnceWith(
      `${GCSIM_TREES_URL}/${GCSIM_MAIN_COMMIT}?recursive=1`,
      undefined,
    );
    expect(vi.mocked(fetchOk)).toHaveBeenCalledExactlyOnceWith(`${GCSIM_RAW_URL}/${GCSIM_MAIN_COMMIT}/${configPath}`);
  });
});
