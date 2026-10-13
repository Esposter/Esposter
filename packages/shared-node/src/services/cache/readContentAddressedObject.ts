import { CONTENT_CACHE_DIRECTORY } from "#src/services/cache/constants";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// One object's bytes by the hex SHA-256 they hash to: read from the cache, else downloaded once and kept only when its
// Bytes hash to that name, so a hit never needs checking and never goes stale. A writer that loses the race to the same
// Name wrote the same bytes, so its rename failing over the winner's file is still a hit
export const readContentAddressedObject = async (
  hash: string,
  download: () => Promise<Uint8Array>,
  directory: string = CONTENT_CACHE_DIRECTORY,
): Promise<Buffer> => {
  const path = join(directory, hash);
  if (existsSync(path)) return readFile(path);
  const bytes = Buffer.from(await download());
  if (createHash("sha256").update(bytes).digest("hex") !== hash)
    throw new InvalidOperationError(Operation.Read, hash, "does not hash to its name");
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${path}.${crypto.randomUUID()}.part`;
  await writeFile(temporaryPath, bytes);
  await getResultAsync(() => rename(temporaryPath, path)).match(noop, async (error) => {
    await rm(temporaryPath, { force: true });
    if (!existsSync(path)) throw error;
  });
  return bytes;
};
