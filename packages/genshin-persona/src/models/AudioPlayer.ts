// One reading's playback: each clip in turn, answered with "" once it played or with why it did not, and the process
// Ended once the reading is
export interface AudioPlayer {
  close: () => Promise<void>;
  play: (audio: Uint8Array) => Promise<string>;
}
