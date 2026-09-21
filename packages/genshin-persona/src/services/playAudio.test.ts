import type { spawn as baseSpawn } from "node:child_process";

import { PLAYER_FILE_PREFIX } from "#src/services/constants";
import { playAudio } from "#src/services/playAudio";
import { EventEmitter } from "node:events";
import { readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

// The player as it answers once the call is already awaiting it, which is the only order a spawned process can
// Answer a caller in
const getPlayer = (answer: (player: EventEmitter) => void) => {
  const player = new EventEmitter();
  setImmediate(() => {
    answer(player);
  });
  return player as ReturnType<typeof baseSpawn>;
};
const checkHasLeftovers = () => readdirSync(tmpdir()).some((name) => name.startsWith(PLAYER_FILE_PREFIX));

describe(playAudio, () => {
  test("runs the player with its window hidden, and deletes the WAV after", async () => {
    expect.hasAssertions();

    spawn.mockReturnValueOnce(
      getPlayer((player) => {
        player.emit("close", 0);
      }),
    );

    await expect(playAudio(new Uint8Array())).resolves.toBe("");
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn.mock.calls[0]?.[2]).toStrictEqual({ stdio: "ignore", windowsHide: true });
    expect(checkHasLeftovers()).toBe(false);
  });

  test.each([
    {
      answer: (player: EventEmitter) => {
        player.emit("error", new Error("playAudio"));
      },
      expected: "playAudio",
      name: "a player that could not be spawned",
    },
    {
      answer: (player: EventEmitter) => {
        player.emit("close", 1);
      },
      expected: "the player exited 1",
      name: "a player that refused the file",
    },
    {
      answer: (player: EventEmitter) => player.emit("close", null, "SIGKILL"),
      expected: "the player was stopped by SIGKILL",
      name: "a player the OS stopped, which closes with a signal and no exit status",
    },
  ])("answers $name with why", async ({ answer, expected }) => {
    expect.hasAssertions();

    spawn.mockReturnValueOnce(getPlayer(answer));

    await expect(playAudio(new Uint8Array())).resolves.toBe(expected);
    expect(checkHasLeftovers()).toBe(false);
  });
});
