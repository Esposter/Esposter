import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/constants";
import { runGh } from "#src/services/coderabbit/runGh";
import { parseMachineJson } from "#src/services/parseMachineJson";

// `--paginate --slurp` emits an array of pages rather than a flat array, and `gh` rejects pairing it with
// `--jq` — which is the point: `gh` re-runs a `--jq` filter once per page, so anything that must see the whole
// Result set (a sort, a `last`, a count) describes one page there, silently, and only once the pull request
// Passes one page. Aggregation therefore happens here, over every page at once.
export const readBotEntries = <TEntry extends GitHubEntry>(path: string): TEntry[] =>
  parseMachineJson<TEntry[][]>(runGh(["api", `repos/{owner}/{repo}/${path}?per_page=100`, "--paginate", "--slurp"]))
    .flat()
    .filter(({ user }) => user.login === CODERABBIT_REST_LOGIN);
