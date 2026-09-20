// One clip's row in a Wwise package's externals table: where its bytes sit inside the same file
export interface AkpkEntry {
  // The 64-bit hash of the clip's path, which is how a game-data line finds its own audio
  id: bigint;
  offset: number;
  size: number;
}
