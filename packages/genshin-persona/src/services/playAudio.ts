import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Each desktop's stock player, handed a WAV on disk: none of them reads audio from a pipe, and a temp file the
// Player has finished with is deleted whether or not it played
export const playAudio = (audio: Uint8Array): void => {
  const audioPath = join(tmpdir(), `genshin-persona-${process.pid}.wav`);
  writeFileSync(audioPath, audio);
  if (process.platform === "win32")
    spawnSync("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `(New-Object System.Media.SoundPlayer '${audioPath}').PlaySync()`,
    ]);
  else if (process.platform === "darwin") spawnSync("afplay", [audioPath]);
  else spawnSync("aplay", ["-q", audioPath]);

  rmSync(audioPath, { force: true });
};
