import type { DumpFile } from "#src/models/genshinText/DumpFile";
import type { Tree } from "#src/models/genshinText/Tree";

import { ANIME_GAME_DATA_BRANCH, ANIME_GAME_DATA_TREES_URL } from "#src/services/genshinText/constants";
import { readGitHubHeaders } from "#src/services/genshinText/readGitHubHeaders";
import { fetchJson } from "#src/services/shared/fetchJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A directory of the AnimeGameData repository listed as its files, each with its path from the repository root and the
// SHA-1 git names its content by. A tree the API cut short throws, so a listing is never silently missing files. The
// Listing is authorized by GITHUB_TOKEN when one is set, since the API's anonymous limit is 60 requests an hour
export const listRemoteDirectory = async (directory: string): Promise<DumpFile[]> => {
  const { tree, truncated } = await fetchJson<Tree>(
    `${ANIME_GAME_DATA_TREES_URL}/${ANIME_GAME_DATA_BRANCH}:${directory}`,
    readGitHubHeaders(process.env.GITHUB_TOKEN),
  );
  if (truncated) throw new InvalidOperationError(Operation.Read, directory, "its tree listing was truncated");
  return tree.flatMap(({ path, sha, type }) => (type === "blob" ? [{ path: `${directory}/${path}`, sha }] : []));
};
