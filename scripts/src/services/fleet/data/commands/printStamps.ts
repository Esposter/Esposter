import { checkIsStampPath } from "#src/services/fleet/data/checkIsStampPath";
import { STAMP_CONCURRENCY } from "#src/services/fleet/data/constants";
import { readStamp } from "#src/services/provenance/readStamp";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { join } from "node:path";

// Prints each named stamp that exists under the parity directory as one JSON line, after checking that every path names
// A stamp inside it, so nothing outside the directory is ever read
export const printStamps = async (parityDirectory: string, paths: string[]): Promise<void> => {
  for (const path of paths)
    if (!checkIsStampPath(path))
      throw new InvalidOperationError(Operation.Read, path, "is not a provenance stamp inside the parity directory");
  const stamps = await settleAll(
    paths.map((path) => async () => ({ path, provenance: await readStamp(join(parityDirectory, path)) })),
    STAMP_CONCURRENCY,
  );
  for (const { path, provenance } of stamps)
    if (provenance !== undefined) console.info(JSON.stringify({ path, provenance }));
};
