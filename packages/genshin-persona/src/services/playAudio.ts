import type { SpawnSyncOptions } from "node:child_process";

import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The player's window stays hidden: the synthesizer runs detached with no console of its own, and a console
// Program spawned from one is given a new window otherwise
const PLAYER_OPTIONS: SpawnSyncOptions = { windowsHide: true };

// Each desktop's stock player, handed a WAV on disk: none of them reads audio from a pipe, and a temp file the
// Player has finished with is deleted whether or not it played
export const playAudio = (audio: Uint8Array): void => {
  const audioPath = join(tmpdir(), `genshin-persona-${process.pid}.wav`);
  writeFileSync(audioPath, audio);
  if (process.platform === "win32")
    spawnSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", `(New-Object System.Media.SoundPlayer '${audioPath}').PlaySync()`],
      PLAYER_OPTIONS,
    );
  else if (process.platform === "darwin") spawnSync("afplay", [audioPath], PLAYER_OPTIONS);
  else spawnSync("aplay", ["-q", audioPath], PLAYER_OPTIONS);

  rmSync(audioPath, { force: true });
};
