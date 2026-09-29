import { CAPTURES_DIRECTORY, GAME_WINDOW_TITLE, RECORD_FRAME_RATE } from "#src/services/genshinParity/constants";
import { runFfmpeg } from "#src/services/genshinParity/runFfmpeg";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// The game's window, read off the desktop as any screen recorder reads it: a still, or a recording of a set length.
// Nothing is ever sent to the game, whose terms count injected input as botting
export const captureGame = async (name: string, seconds?: number): Promise<void> => {
  await mkdir(CAPTURES_DIRECTORY, { recursive: true });
  const input = ["-f", "gdigrab", "-framerate", String(RECORD_FRAME_RATE), "-i", `title=${GAME_WINDOW_TITLE}`];
  const path = join(CAPTURES_DIRECTORY, seconds === undefined ? `${name}.png` : `${name}.mp4`);
  runFfmpeg(
    seconds === undefined
      ? [...input, "-frames:v", "1", path]
      : [...input, "-t", String(seconds), "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", path],
  );
  console.log(path);
};
