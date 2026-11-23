import { BINARY_BYTE } from "#src/services/sweeps/constants";
import { withFinalizer } from "@esposter/shared";
import { closeSync, openSync, readSync } from "node:fs";

const CHUNK_BYTES = 64 * 1024;

// Whether a file holds a NUL byte anywhere. It is read a chunk at a time, so a binary file stops at the first chunk that
// Holds one, which a picture does early, and only a text file, which holds none, is read whole
export const checkHoldsBinaryByte = (path: string): boolean => {
  const chunk = Buffer.allocUnsafe(CHUNK_BYTES);
  const fd = openSync(path, "r");
  return withFinalizer(
    () => {
      let bytesRead = readSync(fd, chunk, 0, CHUNK_BYTES, null);
      while (bytesRead > 0) {
        if (chunk.subarray(0, bytesRead).includes(BINARY_BYTE)) return true;
        bytesRead = readSync(fd, chunk, 0, CHUNK_BYTES, null);
      }
      return false;
    },
    () => {
      closeSync(fd);
    },
  );
};
