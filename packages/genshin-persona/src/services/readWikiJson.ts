import { WIKI_FETCH_TIMEOUT_MS, WIKI_USER_AGENT } from "#src/services/constants";

// Every read the plugin makes of the wiki's API goes through here: the user agent the wiki asks a client to name itself
// By, and the timeout that keeps a host which takes the connection and never finishes from holding the hook a reply waits
// Behind. The plugin a stranger installs carries no `@esposter/shared` (`parseJsonObject`), so this is its own. An answer
// The reader's guard does not take reads as absent, the same as a page the wiki does not hold. The scripts' own requests
// Go through `readWikiApi` instead, which throws on an answer its schema refuses
export const readWikiJson = async <T>(url: string, checkIs: (value: unknown) => value is T): Promise<T | undefined> => {
  const response = await fetch(url, {
    headers: { "user-agent": WIKI_USER_AGENT },
    signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS),
  });
  const json: unknown = await response.json();
  return checkIs(json) ? json : undefined;
};
