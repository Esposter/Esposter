import type { SpawnSyncOptions } from "node:child_process";

import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The player's window stays hidden: the synthesizer runs detached with no console of its own, and a console
// Program spawned from one is given a new window otherwise
const PLAYER_OPTIONS: SpawnSyncOptions = { windowsHide: true };

const spawnPlayer = (audioPath: string) => {
  if (process.platform === "win32")
    return spawnSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", `(New-Object System.Media.SoundPlayer '${audioPath}').PlaySync()`],
      PLAYER_OPTIONS,
    );
  else if (process.platform === "darwin") return spawnSync("afplay", [audioPath], PLAYER_OPTIONS);
  return spawnSync("aplay", ["-q", audioPath], PLAYER_OPTIONS);
};

// Each desktop's stock player, handed a WAV on disk: none of them reads audio from a pipe, and a temp file the
// Player has finished with is deleted whether or not it played. Why it did not play — a player not installed, or
// One that refused the file — or "" once it did, since the sound is the only other sign
export const playAudio = (audio: Uint8Array): string => {
  const audioPath = join(tmpdir(), `genshin-persona-${process.pid}.wav`);
  writeFileSync(audioPath, audio);
  const { error, status } = spawnPlayer(audioPath);
  rmSync(audioPath, { force: true });
  if (error) return error.message;

  return status === 0 ? "" : `the player exited ${status}`;
};
