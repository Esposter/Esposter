import type { Tree } from "#src/models/genshinText/Tree";
import type { TreeEntry } from "#src/models/genshinText/TreeEntry";

import { fetchJson } from "#src/services/shared/fetchJson";
import { readGitHubHeaders } from "#src/services/shared/readGitHubHeaders";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A tree from the GitHub Git Trees API, authorized by GITHUB_TOKEN when one is set, since the API's anonymous limit is 60
// Requests an hour. A tree the API cut short throws, so a listing is never silently missing files
export const fetchGitHubTree = async (url: string, name: string): Promise<TreeEntry[]> => {
  const { tree, truncated } = await fetchJson<Tree>(url, readGitHubHeaders(process.env.GITHUB_TOKEN));
  if (truncated) throw new InvalidOperationError(Operation.Read, name, "its tree listing was truncated");
  return tree;
};
