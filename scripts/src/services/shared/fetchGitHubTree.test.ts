import { fetchGitHubTree } from "#src/services/shared/fetchGitHubTree";
import { fetchJson } from "#src/services/shared/fetchJson";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/fetchJson"));

describe(fetchGitHubTree, () => {
  const url = "https://api.github.com/repos/owner/repository/git/trees/a";
  const name = "a";

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  test("A tree the API cut short throws", async () => {
    expect.hasAssertions();

    vi.mocked(fetchJson).mockResolvedValueOnce({ tree: [], truncated: true });

    await expect(fetchGitHubTree(url, name)).rejects.toThrowError(name);
  });

  test("A token authorizes the request", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_TOKEN", "token");
    vi.mocked(fetchJson).mockResolvedValueOnce({ tree: [], truncated: false });

    await fetchGitHubTree(url, name);

    expect(vi.mocked(fetchJson)).toHaveBeenCalledExactlyOnceWith(url, { Authorization: "Bearer token" });
  });
});
