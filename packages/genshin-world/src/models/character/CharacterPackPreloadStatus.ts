// Where the opening's download of the published packs stands: not yet planned, fetching the files the cache lacks, held in
// Full, or stopped by a file that failed its attempts
export enum CharacterPackPreloadStatus {
  Downloading = "downloading",
  Failed = "failed",
  Idle = "idle",
  Ready = "ready",
}
