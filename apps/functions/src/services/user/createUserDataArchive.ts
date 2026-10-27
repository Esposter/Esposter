import type { UserDataArchive } from "#src/models/user/UserDataArchive";

import { Zip, ZipDeflate } from "fflate";
import { once } from "node:events";
import { PassThrough } from "node:stream";

// `fflate`'s streaming zip pushes each entry's bytes into the PassThrough the upload reads, so the archive is built as it
// Is read rather than in memory. Pushing is synchronous, so an entry checks the stream after each push and waits for it
// To drain before reading more of its source
export const createUserDataArchive = (): UserDataArchive => {
  const output = new PassThrough();
  const zip = new Zip((error, chunk) => {
    if (error) output.destroy(error);
    else output.write(chunk);
  });
  const waitForDrain = async () => {
    if (output.writableNeedDrain) await once(output, "drain");
  };
  const addEntry = async (name: string, source: NodeJS.ReadableStream | Uint8Array) => {
    const entry = new ZipDeflate(name);
    zip.add(entry);
    const chunks = source instanceof Uint8Array ? [source] : source;
    for await (const chunk of chunks) {
      // A blob is read without an encoding, so its chunks are bytes; a string only reaches here from a text stream
      entry.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk, false);
      // oxlint-disable-next-line no-await-in-loop -- Backpressure: each chunk is pushed before the next is read
      await waitForDrain();
    }
    entry.push(new Uint8Array(), true);
    await waitForDrain();
  };
  const addJsonEntry = (name: string, value: unknown) =>
    addEntry(name, new TextEncoder().encode(JSON.stringify(value)));
  const end = () => {
    zip.end();
    output.end();
  };

  return { addEntry, addJsonEntry, end, output };
};
