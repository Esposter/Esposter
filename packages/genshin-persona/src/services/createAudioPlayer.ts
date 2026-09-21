import type { AudioPlayer } from "#src/models/AudioPlayer";
import type { SpawnOptions } from "node:child_process";

import { PLAYER_FILE_PREFIX } from "#src/services/constants";
import { spawn } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The player's window stays hidden: the synthesizer runs detached with no console of its own, and a console
// Program spawned from one is given a new window otherwise
const PLAYER_OPTIONS: SpawnOptions = { stdio: ["pipe", "pipe", "ignore"], windowsHide: true };
// Each desktop's stock player, run as one loop per reading: a WAV path per line on stdin, played in turn, and one
// Line back per path — empty once it played, else why not. Spawning the player once per reading rather than once
// Per clip matters on Windows, where a PowerShell start costs seconds a sentence would otherwise wait in silence
const WINDOWS_PLAYER_SCRIPT =
  "while ($null -ne ($path = [Console]::In.ReadLine())) { try { (New-Object System.Media.SoundPlayer $path).PlaySync(); [Console]::Out.WriteLine('') } catch { [Console]::Out.WriteLine($_.Exception.Message) } }";
const getUnixPlayerScript = (player: string) =>
  `while IFS= read -r path; do if ${player} "$path" >/dev/null 2>&1; then echo; else echo "the player exited $?"; fi; done`;

const spawnPlayer = () => {
  if (process.platform === "win32")
    return spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_PLAYER_SCRIPT], PLAYER_OPTIONS);
  else
    return spawn(
      "sh",
      ["-c", getUnixPlayerScript(process.platform === "darwin" ? "afplay" : "aplay -q")],
      PLAYER_OPTIONS,
    );
};

// The player spawned at once, so its start overlaps the first clip's synthesis. A clip is written to a temp file of
// Its own, since no stock player reads audio from a pipe and the next clip is written while this one plays, and
// Deleted once answered whether or not it played. A player that could not be spawned, or that exited part way,
// Answers every clip left with why
export const createAudioPlayer = (): AudioPlayer => {
  const player = spawnPlayer();
  let answers: ((failure: string) => void)[] = [];
  const { promise: exit, resolve: resolveExit } = Promise.withResolvers<void>();
  let exitFailure = "";
  let buffer = "";
  const settle = (failure: string) => {
    exitFailure = failure;
    const pendingAnswers = answers;
    answers = [];
    for (const answer of pendingAnswers) answer(failure);
    resolveExit();
  };
  player.stdout?.setEncoding("utf8");
  player.stdout?.on("data", (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) answers.shift()?.(line.trimEnd());
  });
  player.on("error", (error) => {
    settle(error.message);
  });
  player.on("close", (status, signal) => {
    settle(signal ? `the player was stopped by ${signal}` : `the player exited ${status}`);
  });
  // A write to a player that has exited is answered by the close handler, not by the pipe
  player.stdin?.on("error", () => {});

  return {
    close: () => {
      player.stdin?.end();
      return exit;
    },
    play: (audio) => {
      if (exitFailure) return Promise.resolve(exitFailure);

      const audioPath = join(tmpdir(), `${PLAYER_FILE_PREFIX}${crypto.randomUUID()}.wav`);
      writeFileSync(audioPath, audio);
      const { promise, resolve } = Promise.withResolvers<string>();
      answers.push((failure) => {
        rmSync(audioPath, { force: true });
        resolve(failure);
      });
      player.stdin?.write(`${audioPath}\n`);
      return promise;
    },
  };
};
