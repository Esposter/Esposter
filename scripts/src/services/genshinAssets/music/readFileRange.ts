import type { FileHandle } from "node:fs/promises";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The bytes of a file from an offset, read until all of them arrive, since a read may return fewer than it asked
// For; a file ending first throws rather than leaving the rest of the buffer zeroed
export const readFileRange = async (file: FileHandle, path: string, offset: number, size: number): Promise<Buffer> => {
  const buffer = Buffer.alloc(size);
  let length = 0;
  while (length < size) {
    // oxlint-disable-next-line no-await-in-loop -- each read starts where the last one stopped
    const { bytesRead } = await file.read(buffer, length, size - length, offset + length);
    if (bytesRead === 0) throw new InvalidOperationError(Operation.Read, path, `ends before byte ${offset + size}`);
    length += bytesRead;
  }
  return buffer;
};
