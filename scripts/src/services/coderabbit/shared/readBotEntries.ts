import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// The bot's entries alone — `readEntries` owns the pagination, this is the author filter on top of it
export const readBotEntries = <TEntry extends GitHubEntry>(path: string): TEntry[] =>
  readEntries<TEntry>(path).filter(({ user }) => user.login === CODERABBIT_REST_LOGIN);
