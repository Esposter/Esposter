import {
  GAME_BLOCKS_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  PARITY_DIRECTORY_NAME,
  PARITY_TYPE_EXPORT_ARGUMENTS,
} from "#src/services/genshinAssets/shared/constants";
import { countFiles } from "#src/services/genshinAssets/shared/countFiles";
import { readAnimeStudioExceptions } from "#src/services/recreation/animeStudio/readAnimeStudioExceptions";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, parse } from "node:path";

// Exports one reference block with the freshly staged CLI, one run per parity type as Windows' counts were taken,
// And compares each type's file count with the table. No run may name an exception
export const checkParityBlock = (
  cliPath: string,
  block: string,
  expectedTypeCountMap: Record<string, number>,
  directory: string,
): void => {
  const mismatches: string[] = [];
  const typeCountMap: Record<string, number> = {};
  for (const [type, exportArguments] of Object.entries(PARITY_TYPE_EXPORT_ARGUMENTS)) {
    const outputDirectory = join(directory, PARITY_DIRECTORY_NAME, parse(block).name, type);
    rmSync(outputDirectory, { force: true, recursive: true });
    mkdirSync(outputDirectory, { recursive: true });
    const { error, status, stderr, stdout } = spawnSync(
      cliPath,
      [
        join(GAME_BLOCKS_DIRECTORY, block),
        outputDirectory,
        "--types",
        type,
        ...exportArguments,
        "--group_assets",
        "ByType",
        "--game",
        GENSHIN_ANIMESTUDIO_OPTIONS.game,
        "--logger_flags",
        "Warning",
        "Error",
      ],
      { cwd: dirname(cliPath), encoding: "utf8", maxBuffer: 1024 ** 3 },
    );
    if (status !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        block,
        stderr || stdout || error?.message || `exited ${status}`,
      );
    mismatches.push(...readAnimeStudioExceptions(`${stdout}\n${stderr}`).slice(0, 5));
    const typeDirectory = join(outputDirectory, type);
    typeCountMap[type] = existsSync(typeDirectory) ? countFiles(typeDirectory) : 0;
    if (typeCountMap[type] !== (expectedTypeCountMap[type] ?? 0))
      mismatches.push(`${type} ${typeCountMap[type]}, Windows ${expectedTypeCountMap[type] ?? 0}`);
  }
  if (mismatches.length > 0)
    throw new InvalidOperationError(Operation.Create, block, `does not match Windows: ${mismatches.join("; ")}`);
  console.log(`${block}: ${JSON.stringify(typeCountMap)}, matches Windows`);
};
