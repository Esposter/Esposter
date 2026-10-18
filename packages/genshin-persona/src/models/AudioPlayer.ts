import type { ViewerCaption } from "#src/models/ViewerCaption";

// One reading's playback: each clip in turn, answered with "" once it played or with why it did not, and the process
// Ended once the reading is. A viewer takes the caption beside the clip and the stock player ignores it
export interface AudioPlayer {
  close: () => Promise<void>;
  play: (audio: Uint8Array, caption?: ViewerCaption) => Promise<string>;
  // Ends what the viewer is playing and clears its caption, where a viewer carries the reading
  stop?: () => void;
}
