import { WIKI_FETCH_TIMEOUT_MS, WIKI_USER_AGENT } from "#src/services/constants";

// Every read of the wiki's API goes through here: the user agent the wiki asks a client to name itself by, and the
// Timeout that keeps a host which takes the connection and never finishes from holding the hook a reply waits
// Behind. The plugin a stranger installs carries no `@esposter/shared` (`parseJsonObject`), so this is its own. An
// Answer the reader's guard does not take reads as absent, the same as a page the wiki does not hold
export const readWikiJson = async <T>(url: string, checkIs: (value: unknown) => value is T): Promise<T | undefined> => {
  const response = await fetch(url, {
    headers: { "user-agent": WIKI_USER_AGENT },
    signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS),
  });
  const json: unknown = await response.json();
  return checkIs(json) ? json : undefined;
};
