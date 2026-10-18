import type { AudioPlayer } from "#src/models/AudioPlayer";
import type { ViewerPlayer } from "#src/services/createViewerPlayer";

import { ViewerSoundForm } from "#src/models/ViewerSoundForm";

// A reading's player where a viewer is on file: each clip goes to the viewer while it is open, and to the stock player
// From the first clip after it closes. The stock player is spawned for the first clip that needs it, so a reading the
// Viewer carries never pays for one. A sound form that needs a compressed clip keeps the sound on the stock player, and
// The viewer shows the bubble alone beside it
export const createReadingPlayer = (
  viewer: ViewerPlayer,
  createStock: () => AudioPlayer,
  soundForm: ViewerSoundForm,
): AudioPlayer => {
  let stock: AudioPlayer | undefined;
  const playOnStock = (audio: Uint8Array) => {
    stock ??= createStock();
    return stock.play(audio);
  };
  return {
    close: async () => {
      await stock?.close();
    },
    play: async (audio, caption) => {
      if (!caption || !viewer.isOpen()) return playOnStock(audio);
      if (soundForm === ViewerSoundForm.WavPath) return viewer.play(audio, caption);

      const [, failure] = await Promise.all([viewer.show(caption), playOnStock(audio)]);
      return failure;
    },
    stop: () => {
      viewer.stop();
    },
  };
};
