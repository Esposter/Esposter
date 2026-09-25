import { WIKI_FETCH_TIMEOUT_MS, WIKI_USER_AGENT } from "#src/services/constants";

// Every read of the wiki's API goes through here: the user agent the wiki asks a client to name itself by, and the
// Timeout that keeps a host which takes the connection and never finishes from holding the hook a reply waits
// Behind. The plugin a stranger installs carries no `@esposter/shared` (`parseJsonObject`), so this is its own
export const readWikiJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: { "user-agent": WIKI_USER_AGENT },
    signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS),
  });
  return (await response.json()) as T;
};
