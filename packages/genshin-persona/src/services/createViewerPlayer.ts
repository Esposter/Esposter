import type { ViewerCaption } from "#src/models/ViewerCaption";
import type { ViewerLink } from "#src/models/ViewerLink";

import {
  PLAYER_FILE_PREFIX,
  VIEWER_BUBBLE_BEAT_MS,
  VIEWER_CLEAR_DURATION_MS,
  VIEWER_DEFAULT_FRAME_COLOR,
  VIEWER_TEXT_COLOR,
} from "#src/services/constants";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A reading's clips on the model: each written to a file, shown as a bubble and sounded on the model, and the next
// Clip held until this one's length has passed. The last clip stays on disk for a tap to play again, and is the only
// One kept, since the stock player deletes its clips once answered and a viewer answers the message, not the sound
export interface ViewerPlayer {
  dispose: () => void;
  isOpen: () => boolean;
  play: (audio: Uint8Array, caption: ViewerCaption) => Promise<string>;
  stop: () => void;
}

export const createViewerPlayer = (link: ViewerLink, modelId: number): ViewerPlayer => {
  let shown: { caption: ViewerCaption; path: string } | undefined;
  let cancelWait = () => {};
  const show = ({ caption, path }: { caption: ViewerCaption; path: string }) => {
    link.bubble(modelId, caption.text, caption.durationMs + VIEWER_BUBBLE_BEAT_MS, caption.color, VIEWER_TEXT_COLOR);
    link.playSound(modelId, path);
  };
  // A tap plays the line the character said last again, from the clip already on disk
  link.onTap(() => {
    if (shown) show(shown);
  });

  return {
    dispose: () => {
      cancelWait();
      if (shown) rmSync(shown.path, { force: true });
      shown = undefined;
      link.close();
    },
    isOpen: () => link.isOpen(),
    play: async (audio, caption) => {
      if (!link.isOpen()) return "the viewer is not open";

      const path = join(tmpdir(), `${PLAYER_FILE_PREFIX}${crypto.randomUUID()}.wav`);
      writeFileSync(path, audio);
      if (shown) rmSync(shown.path, { force: true });
      shown = { caption, path };
      show(shown);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, caption.durationMs);
        cancelWait = () => {
          clearTimeout(timer);
          resolve();
        };
      });
      return "";
    },
    stop: () => {
      cancelWait();
      link.soundStop(modelId);
      const color = shown?.caption.color ?? VIEWER_DEFAULT_FRAME_COLOR;
      link.bubble(modelId, "", VIEWER_CLEAR_DURATION_MS, color, VIEWER_TEXT_COLOR);
    },
  };
};
