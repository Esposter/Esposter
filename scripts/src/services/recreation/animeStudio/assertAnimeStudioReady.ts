import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";

// Refuses an AnimeStudio run its files could not be read by: the guard reporting them in use, or the executable not
// Unpacked where its options name it
export const assertAnimeStudioReady = ({
  blockGuard,
  executableHint,
  executablePath,
}: Pick<AnimeStudioOptions, "blockGuard" | "executableHint" | "executablePath">): void => {
  if (blockGuard?.checkIsBlocked())
    throw new InvalidOperationError(Operation.Read, blockGuard.subject, blockGuard.reason);
  if (!existsSync(executablePath))
    throw new InvalidOperationError(Operation.Read, executablePath, `not found: ${executableHint}`);
};
