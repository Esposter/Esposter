import { assertContentAddress } from "#src/services/cache/assertContentAddress";
import { HOSTED_ASSETS_MIRROR_DIRECTORY } from "#src/services/cache/constants";
import { getContentAddress } from "#src/services/cache/getContentAddress";
import { writePartialThenMove } from "#src/services/cache/writePartialThenMove";
import { ASSET_HASH_REGEX, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// One object's bytes by the hex SHA-256 they hash to: read from the cache, else downloaded once and kept only when its
// Bytes hash to that name, so a hit is served as kept and never goes stale, and a caller that needs proof checks it against the name. A writer that loses the race to the same
// Name wrote the same bytes, so its rename failing over the winner's file is still a hit. The name is joined into a
// Path before anything reads it, so one that is not a hex digest is refused first rather than read from outside the directory
export const readContentAddressedObject = async (
  hash: string,
  download: () => Promise<Uint8Array>,
  directory: string = HOSTED_ASSETS_MIRROR_DIRECTORY,
): Promise<Buffer> => {
  if (!ASSET_HASH_REGEX.test(hash))
    throw new InvalidOperationError(Operation.Read, hash, "is not a SHA-256 hex digest");
  const path = join(directory, hash);
  if (existsSync(path)) return readFile(path);
  const bytes = Buffer.from(await download());
  assertContentAddress(hash, hash, getContentAddress(bytes));
  await getResultAsync(() => writePartialThenMove(path, (partialPath) => writeFile(partialPath, bytes))).match(
    noop,
    (error) => {
      if (!existsSync(path)) throw error;
    },
  );
  return bytes;
};
