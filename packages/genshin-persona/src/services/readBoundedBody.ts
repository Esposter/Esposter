import type { Readable } from "node:stream";

// The one read of an outside body, held whole only up to `maxBytes`: a chunk is dropped as it arrives once the body is
// Past the ceiling, so an endless answer is never held whole. Undefined for a body past the ceiling, and for a stream
// That fails before its end: a reset or a timeout reads as an absent body, the same as a page the wiki does not hold. A
// Body with no stream at all (a fetch answer with none) is empty. Every read of an outside body goes through here, so a
// Reader that takes a ceiling cannot be written to hold an unbounded one
export const readBoundedBody = (
  body: null | Readable,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | undefined> =>
  new Promise((resolve) => {
    if (!body) {
      resolve(new Uint8Array());
      return;
    }

    const chunks: Buffer[] = [];
    let size = 0;
    body.on("data", (chunk: Buffer) => {
      size += chunk.length;
      // Destroying the body stops the rest of an answer past the ceiling from being read
      if (size > maxBytes) {
        body.destroy();
        resolve(undefined);
        return;
      }

      chunks.push(chunk);
    });
    body.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    body.on("error", () => {
      resolve(undefined);
    });
  });
