import { WIKI_FETCH_TIMEOUT_MS, WIKI_USER_AGENT } from "#src/services/constants";
import { readBoundedBody } from "#src/services/readBoundedBody";
import { Readable } from "node:stream";

// Every read the plugin makes of the wiki's API goes through here: the user agent the wiki asks a client to name itself
// By, and the timeout that keeps a host which takes the connection and never finishes from holding the hook a reply
// Waits behind. The body is read through `readBoundedBody` at the ceiling the caller names, so an answer past it reads
// As absent too. The plugin a stranger installs carries no `@esposter/shared` (`parseJsonObject`), so this is its own.
// An answer the reader's guard does not take reads as absent, the same as a page the wiki does not hold. The scripts'
// Own requests go through `readWikiApi` instead, which throws on an answer its schema refuses
export const readWikiJson = async <T>(
  url: string,
  checkIs: (value: unknown) => value is T,
  maxBytes: number,
): Promise<T | undefined> => {
  const response = await fetch(url, {
    headers: { "user-agent": WIKI_USER_AGENT },
    signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS),
  });
  const bytes = await readBoundedBody(response.body ? Readable.from(response.body) : null, maxBytes);
  if (!bytes) return undefined;

  const json: unknown = await new Response(bytes).json();
  return checkIs(json) ? json : undefined;
};
