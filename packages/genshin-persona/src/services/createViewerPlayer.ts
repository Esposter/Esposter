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

// A reading's clips on the model: each shown as a bubble, sounded on the model when it has a file, and the next clip
// Held until this one's length has passed. The last clip stays on disk for a tap to play again, and is the only one
// Kept, since the stock player deletes its clips once answered and a viewer answers the message, not the sound
export interface ViewerPlayer {
  dispose: () => void;
  isOpen: () => boolean;
  play: (audio: Uint8Array, caption: ViewerCaption) => Promise<string>;
  // A bubble alone, for a clip whose sound another player plays
  show: (caption: ViewerCaption) => Promise<void>;
  stop: () => void;
}

export const createViewerPlayer = (link: ViewerLink, modelId: number): ViewerPlayer => {
  let shown: { caption: ViewerCaption; path?: string } | undefined;
  let cancelWait = () => {};
  const showCaption = ({ caption, path }: { caption: ViewerCaption; path?: string }) => {
    link.bubble(modelId, caption.text, caption.durationMs + VIEWER_BUBBLE_BEAT_MS, caption.color, VIEWER_TEXT_COLOR);
    if (path) link.playSound(modelId, path);
  };
  const remember = (caption: ViewerCaption, path?: string) => {
    if (shown?.path) rmSync(shown.path, { force: true });
    shown = { caption, path };
    showCaption(shown);
  };
  const holdFor = (durationMs: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, durationMs);
      cancelWait = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  // A tap plays the line the character said last again, from the clip already on disk
  link.onTap(() => {
    if (shown) showCaption(shown);
  });

  return {
    dispose: () => {
      cancelWait();
      if (shown?.path) rmSync(shown.path, { force: true });
      shown = undefined;
      link.close();
    },
    isOpen: () => link.isOpen(),
    play: async (audio, caption) => {
      if (!link.isOpen()) return "the viewer is not open";

      const path = join(tmpdir(), `${PLAYER_FILE_PREFIX}${crypto.randomUUID()}.wav`);
      writeFileSync(path, audio);
      remember(caption, path);
      await holdFor(caption.durationMs);
      return "";
    },
    show: async (caption) => {
      remember(caption);
      await holdFor(caption.durationMs);
    },
    stop: () => {
      cancelWait();
      link.soundStop(modelId);
      const color = shown?.caption.color ?? VIEWER_DEFAULT_FRAME_COLOR;
      link.bubble(modelId, "", VIEWER_CLEAR_DURATION_MS, color, VIEWER_TEXT_COLOR);
    },
  };
};
