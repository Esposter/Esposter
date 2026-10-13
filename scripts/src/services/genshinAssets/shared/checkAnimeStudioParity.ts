import {
  GAME_BLOCKS_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  PARITY_DIRECTORY_NAME,
  PARITY_REFERENCE_BLOCKS,
  PARITY_TYPE_EXPORT_ARGUMENTS,
} from "#src/services/genshinAssets/shared/constants";
import { assertAnimeStudioReady } from "#src/services/recreation/animeStudio/assertAnimeStudioReady";
import { readAnimeStudioExceptions } from "#src/services/recreation/animeStudio/readAnimeStudioExceptions";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, parse } from "node:path";

const countFiles = (directory: string): number =>
  readdirSync(directory, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).length;

// Exports one reference block with the freshly staged CLI, one run per parity type as Windows' counts were taken,
// And compares each type's file count with the table. No run may name an exception
const checkParityBlock = (cliPath: string, block: string, types: Record<string, number>, directory: string): void => {
  const mismatches: string[] = [];
  const typeCounts: Record<string, number> = {};
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
    typeCounts[type] = existsSync(typeDirectory) ? countFiles(typeDirectory) : 0;
    if (typeCounts[type] !== (types[type] ?? 0))
      mismatches.push(`${type} ${typeCounts[type]}, Windows ${types[type] ?? 0}`);
  }
  if (mismatches.length > 0)
    throw new InvalidOperationError(Operation.Create, block, `does not match Windows: ${mismatches.join("; ")}`);
  console.log(`${block}: ${JSON.stringify(typeCounts)}, matches Windows`);
};

// The parity acceptance test, run on the staged CLI: each reference block in the table is exported and compared.
// The game's blocks are read from its install, so when they are absent the check fails.
// It is skipped only with --skip-parity, which prints the reason.
export const checkAnimeStudioParity = (cliPath: string, directory: string, skipParity: boolean): void => {
  const absentBlocks = PARITY_REFERENCE_BLOCKS.filter(({ block }) => !existsSync(join(GAME_BLOCKS_DIRECTORY, block)));
  if (absentBlocks.length > 0) {
    const reason = `the game's blocks are absent under ${GAME_BLOCKS_DIRECTORY} (${absentBlocks.map(({ block }) => block).join(", ")})`;
    if (skipParity) {
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
  for (const { block, types } of PARITY_REFERENCE_BLOCKS) checkParityBlock(cliPath, block, types, directory);
  rmSync(join(directory, PARITY_DIRECTORY_NAME), { force: true, recursive: true });
};
