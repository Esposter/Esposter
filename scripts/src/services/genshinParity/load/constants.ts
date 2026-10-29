import { GENSHIN_WORLD_DIRECTORY, PARITY_BUILD_DIRECTORY_NAME } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

export const PARITY_BUILD_DIRECTORY: string = join(GENSHIN_WORLD_DIRECTORY, PARITY_BUILD_DIRECTORY_NAME);
export const PARITY_BUILD_TASK = "build:parity";

// How long a preview server may take to announce the address it serves
export const PARITY_PREVIEW_TIMEOUT_MS = 60_000;
