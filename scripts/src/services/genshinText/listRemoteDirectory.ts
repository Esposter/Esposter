import type { DumpFile } from "#src/models/genshinText/DumpFile";

import { ANIME_GAME_DATA_COMMIT, ANIME_GAME_DATA_TREES_URL } from "#src/services/genshinText/constants";
import { fetchGitHubTree } from "#src/services/genshinText/fetchGitHubTree";

// A directory of the AnimeGameData repository listed as its files, each with its path from the repository root and the
// SHA-1 git names its content by
export const listRemoteDirectory = async (directory: string): Promise<DumpFile[]> => {
  const tree = await fetchGitHubTree(`${ANIME_GAME_DATA_TREES_URL}/${ANIME_GAME_DATA_COMMIT}:${directory}`, directory);
  return tree.flatMap(({ path, sha, type }) => (type === "blob" ? [{ path: `${directory}/${path}`, sha }] : []));
};
