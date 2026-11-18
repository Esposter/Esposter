import { GROUND_GROUP_SEPARATOR, GROUND_KEY_SEPARATOR } from "#src/services/world/constants";

// The key of a piece split from the piece keyed `parentKey`, named by its quarter's index or a joined group's indices
// Joined with a dash. `parseGroundPieceKey` reads a key back, so the fit that writes a key and the world that reads it
// Share one format
export const getGroundPieceKey = (parentKey: string, indices: readonly number[]): string =>
  [parentKey, indices.join(GROUND_GROUP_SEPARATOR)].join(GROUND_KEY_SEPARATOR);
