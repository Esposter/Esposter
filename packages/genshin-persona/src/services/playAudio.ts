import type { SpawnOptions } from "node:child_process";

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The player's window stays hidden: the synthesizer runs detached with no console of its own, and a console
// Program spawned from one is given a new window otherwise. Its streams go nowhere, since nothing reads them now
// That the call is awaited rather than blocking, and a pipe nobody drains is one more way for a player to wedge
const PLAYER_OPTIONS: SpawnOptions = { stdio: "ignore", windowsHide: true };

const spawnPlayer = (audioPath: string) => {
  if (process.platform === "win32")
    return spawn(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", `(New-Object System.Media.SoundPlayer '${audioPath}').PlaySync()`],
      PLAYER_OPTIONS,
    );
  else if (process.platform === "darwin") return spawn("afplay", [audioPath], PLAYER_OPTIONS);
  return spawn("aplay", ["-q", audioPath], PLAYER_OPTIONS);
};

// Each desktop's stock player, handed a WAV on disk: none of them reads audio from a pipe, and a temp file the
// Player has finished with is deleted whether or not it played. The name carries an id of its own because the
// Next chunk of a reply is written while this one is still being played from its file. Why it did not play — a
// Player not installed, one that refused the file, or one the OS stopped, which closes with the signal it was
// Stopped by in place of an exit status — or "" once it did, since the sound is the only other sign
export const playAudio = async (audio: Uint8Array): Promise<string> => {
  const audioPath = join(tmpdir(), `genshin-persona-${process.pid}-${randomUUID()}.wav`);
  writeFileSync(audioPath, audio);
  const { promise, resolve } = Promise.withResolvers<string>();
  const player = spawnPlayer(audioPath);
  player.on("error", (error) => {
    resolve(error.message);
  });
  player.on("close", (status, signal) => {
    if (status === 0) resolve("");
    else resolve(signal ? `the player was stopped by ${signal}` : `the player exited ${status}`);
  });
  const failure = await promise;
  rmSync(audioPath, { force: true });
  return failure;
};
