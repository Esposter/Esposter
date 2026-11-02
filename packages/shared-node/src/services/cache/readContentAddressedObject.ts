import { CONTENT_CACHE_DIRECTORY } from "#src/services/cache/constants";
import { writePartialThenMove } from "#src/services/cache/writePartialThenMove";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SHA_256_HEX_REGEX = /^[0-9a-f]{64}$/u;

// One object's bytes by the hex SHA-256 they hash to: read from the cache, else downloaded once and kept only when its
// Bytes hash to that name, so a hit never needs checking and never goes stale. A writer that loses the race to the same
// Name wrote the same bytes, so its rename failing over the winner's file is still a hit. The name is joined into a
// Path before anything reads it, so one that is not a hex digest is refused first rather than read from outside the directory
export const readContentAddressedObject = async (
  hash: string,
  download: () => Promise<Uint8Array>,
  directory: string = CONTENT_CACHE_DIRECTORY,
): Promise<Buffer> => {
  if (!SHA_256_HEX_REGEX.test(hash))
    throw new InvalidOperationError(Operation.Read, hash, "is not a SHA-256 hex digest");
  const path = join(directory, hash);
  if (existsSync(path)) return readFile(path);
  const bytes = Buffer.from(await download());
  if (createHash("sha256").update(bytes).digest("hex") !== hash)
    throw new InvalidOperationError(Operation.Read, hash, "does not hash to its name");
  await getResultAsync(() => writePartialThenMove(path, (partialPath) => writeFile(partialPath, bytes))).match(
    noop,
    (error) => {
      if (!existsSync(path)) throw error;
    },
  );
  return bytes;
};
