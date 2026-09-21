// One player process for one reading: each clip played in turn, answered with "" once it played or with why it did
// Not, and the process ended once the reading is
export interface AudioPlayer {
  close: () => Promise<void>;
  play: (audio: Uint8Array) => Promise<string>;
}
