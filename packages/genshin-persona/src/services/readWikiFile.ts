import { WIKI_FETCH_TIMEOUT_MS, WIKI_FILE_MAX_BYTES, WIKI_FILE_REQUEST_HEADERS } from "#src/services/constants";
import { request } from "node:https";

// One file off the wiki's file host, whole, or nothing for a response that is not it — a status other than OK, a
// Body cut short, the ceiling reached. Read over `node:https` rather than `fetch`: the host's edge answers the fetch
// Client's handshake with a browser challenge and the https module's with the file, under the same headers, and
// The API host, which is not behind that edge, is still read with `fetch`
export const readWikiFile = (url: string): Promise<Uint8Array | undefined> =>
  new Promise((resolve) => {
    const clientRequest = request(
      url,
      { headers: WIKI_FILE_REQUEST_HEADERS, signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS) },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          resolve(undefined);
          return;
        }

        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          // The body is dropped as it arrives once it passes the ceiling, so an endless answer is never held whole
          if (size > WIKI_FILE_MAX_BYTES) {
            response.destroy();
            resolve(undefined);
            return;
          }

          chunks.push(chunk);
        });
        response.on("end", () => {
          resolve(response.complete ? Buffer.concat(chunks) : undefined);
        });
        response.on("error", () => {
          resolve(undefined);
        });
      },
    );
    clientRequest.on("error", () => {
      resolve(undefined);
    });
    clientRequest.end();
  });
