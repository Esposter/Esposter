import { Readable } from "node:stream";

// The one read of an outside body, held whole only up to `maxBytes`: a chunk is dropped as it arrives once the body is
// Past the ceiling, so an endless answer is never held whole. Undefined for a body past the ceiling, and for a stream
// That fails before its end: a reset or a timeout reads as an absent body, the same as a page the wiki does not hold. A
// Body with no stream at all (a fetch answer with none) is empty. A fetch body is a web stream and a node response is a
// Readable already, so both are read here. The readers that import this one read every outside body through it, so a
// Reader that takes a ceiling cannot be written to hold an unbounded one; the sins script's counting read in
// `genshin-mods` is the one exception, since a plugin script reaches no shared reader
export const readBoundedBody = (
  body: null | Readable | ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | undefined> =>
  new Promise((resolve) => {
    const stream = body instanceof ReadableStream ? Readable.from(body) : body;
    if (!stream) {
      resolve(new Uint8Array());
      return;
    }

    const chunks: Buffer[] = [];
    let size = 0;
    stream.on("data", (chunk: Buffer) => {
      size += chunk.length;
      // Destroying the body stops the rest of an answer past the ceiling from being read
      if (size > maxBytes) {
        stream.destroy();
        resolve(undefined);
        return;
      }

      chunks.push(chunk);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    stream.on("error", () => {
      resolve(undefined);
    });
  });
