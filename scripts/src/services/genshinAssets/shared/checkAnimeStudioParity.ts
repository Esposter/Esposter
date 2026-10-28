import { checkParityBlock } from "#src/services/genshinAssets/shared/checkParityBlock";
import {
  GAME_BLOCKS_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  PARITY_DIRECTORY_NAME,
  PARITY_REFERENCE_BLOCKS,
} from "#src/services/genshinAssets/shared/constants";
import { assertAnimeStudioReady } from "#src/services/recreation/animeStudio/assertAnimeStudioReady";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// The parity acceptance test, run on the staged CLI: each reference block in the table is exported and compared.
// The game's blocks are read from its install, so when they are absent the check fails.
// It is skipped only with --skip-parity, which prints the reason.
export const checkAnimeStudioParity = (cliPath: string, directory: string, isParitySkipped: boolean): void => {
  const absentBlocks = PARITY_REFERENCE_BLOCKS.filter(({ block }) => !existsSync(join(GAME_BLOCKS_DIRECTORY, block)));
  if (absentBlocks.length > 0) {
    const reason = `the game's blocks are absent under ${GAME_BLOCKS_DIRECTORY} (${absentBlocks.map(({ block }) => block).join(", ")})`;
    if (isParitySkipped) {
      console.log(`Parity check skipped: ${reason}.`);
      return;
    }
    throw new InvalidOperationError(
      Operation.Read,
      GAME_BLOCKS_DIRECTORY,
      `${reason}; pass --skip-parity to build without the parity check`,
    );
  }
  assertAnimeStudioReady({ ...GENSHIN_ANIMESTUDIO_OPTIONS, executablePath: cliPath });
  for (const { block, types: expectedTypeCountMap } of PARITY_REFERENCE_BLOCKS)
    checkParityBlock(cliPath, block, expectedTypeCountMap, directory);
  rmSync(join(directory, PARITY_DIRECTORY_NAME), { force: true, recursive: true });
};
