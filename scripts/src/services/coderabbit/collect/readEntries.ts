import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

import { runGh } from "#src/services/coderabbit/runGh";
import { parseMachineJson } from "#src/services/parseMachineJson";

// Every entry on a REST list endpoint, any author — the collector needs the replies people and it posted, where
// `readBotEntries` keeps the bot's alone. Same pagination shape for the same reason it has.
export const readEntries = <TEntry extends GitHubEntry>(path: string): TEntry[] =>
  parseMachineJson<TEntry[][]>(
    runGh(["api", `repos/{owner}/{repo}/${path}?per_page=100`, "--paginate", "--slurp"]),
  ).flat();
