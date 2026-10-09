import { DEFAULT_PARITY_DIRECTORY } from "#src/services/fleet/data/constants";

// This machine's genshin-parity directory, GENSHIN_PARITY_DIRECTORY when it is set
export const getParityDirectory = (): string => process.env.GENSHIN_PARITY_DIRECTORY || DEFAULT_PARITY_DIRECTORY;
