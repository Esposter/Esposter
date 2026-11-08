import type { StaleRow } from "#src/models/gameVersion/StaleRow";

// A stale row as the status prints it: its command, how many of its outputs are stale, and the game versions they name
export const formatStaleRow = ({ command, gameVersions, outputCount }: StaleRow): string =>
  `${command}: ${outputCount} stale, game version ${gameVersions.join(", ")}`;
