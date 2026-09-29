import {
  CAPTURES_DIRECTORY,
  GAME_EXECUTABLE_NAME,
  RECORD_ENCODING,
  RECORD_FRAME_RATE,
} from "#src/services/genshinParity/constants";
import { runFfmpeg } from "#src/services/genshinParity/runFfmpeg";
import { waitForGameWindow } from "#src/services/genshinParity/waitForGameWindow";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// The game's window, captured as any recorder of one window captures it: a still, or a recording of a set length,
// Written as Matroska so a recording cut short by closing its window is still readable up to the cut.
// Nothing is ever sent to the game, whose terms count injected input as botting
export const captureGame = async (name: string, seconds?: number): Promise<void> => {
  await mkdir(CAPTURES_DIRECTORY, { recursive: true });
  waitForGameWindow();
  // The game's window alone through Windows Graphics Capture, found by its executable: nothing drawn over it, no other
  // Window or the desktop behind, and no cursor, at up to 60 frames a second in the window's own pixels. A minimised
  // Game gives no frames, so switching away never records anything else
  const input = [
    "-f",
    "lavfi",
    "-i",
    `gfxcapture=window_exe=${GAME_EXECUTABLE_NAME}:capture_cursor=0:max_framerate=${RECORD_FRAME_RATE},hwdownload,format=bgra`,
  ];
  const path = join(CAPTURES_DIRECTORY, seconds === undefined ? `${name}.png` : `${name}.mkv`);
  if (seconds === undefined) await runFfmpeg([...input, "-frames:v", "1", path]);
  else
    await runFfmpeg(
      [...input, "-t", String(seconds), ...RECORD_ENCODING, path],
      Temporal.Duration.from({ seconds }).total("milliseconds"),
    );
  console.log(path);
};
