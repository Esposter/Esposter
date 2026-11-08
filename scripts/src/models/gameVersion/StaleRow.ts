// The stale outputs one command wrote: how many, and the game version each names, `none` for one with no readable stamp
export interface StaleRow {
  command: string;
  gameVersions: string[];
  outputCount: number;
}
