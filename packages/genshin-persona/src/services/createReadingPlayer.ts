import type { AudioPlayer } from "#src/models/AudioPlayer";
import type { ViewerPlayer } from "#src/services/createViewerPlayer";

// A reading's player where a viewer is on file: each clip goes to the viewer while it is open, and to the stock player
// from the first clip after it closes. The stock player is spawned for the first clip that needs it, so a reading the
// Viewer carries never pays for one
export const createReadingPlayer = (viewer: ViewerPlayer, createStock: () => AudioPlayer): AudioPlayer => {
  let stock: AudioPlayer | undefined;
  return {
    close: async () => {
      await stock?.close();
    },
    play: (audio, caption) => {
      if (caption && viewer.isOpen()) return viewer.play(audio, caption);

      stock ??= createStock();
      return stock.play(audio);
    },
    stop: () => {
      viewer.stop();
    },
  };
};
