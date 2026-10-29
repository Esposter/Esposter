import { INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The block a command names, as the asset index names it (`00/04949489.blk`), or by its bare id (`04949489`), found in
// whichever folder of the blocks folder holds it
export const resolveUiBlock = async (argument: string): Promise<string> => {
  if (argument.endsWith(".blk")) return argument;
  for (const folder of await readdir(INSTALLED_BLOCKS_DIRECTORY)) {
    const block = `${folder}/${argument}.blk`;
    if (existsSync(join(INSTALLED_BLOCKS_DIRECTORY, block))) return block;
  }
  throw new InvalidOperationError(Operation.Read, argument, "names no installed block");
};
