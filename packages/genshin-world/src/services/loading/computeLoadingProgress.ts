import { LOADING_BYTES_SHARE } from "#src/services/loading/constants";

// The bar the startup loading screen draws: while bytes are pending its first share is the bytes loaded over the bytes
// Pending, and the rest is the world's own steps. With none pending it is the steps alone, as it was before any download
export const computeLoadingProgress = (steps: number, loadedBytes: number, pendingBytes: number): number =>
  pendingBytes > 0 ? LOADING_BYTES_SHARE * (loadedBytes / pendingBytes) + (1 - LOADING_BYTES_SHARE) * steps : steps;
