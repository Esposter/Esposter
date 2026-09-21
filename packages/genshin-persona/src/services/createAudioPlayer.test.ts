import type { spawn as baseSpawn } from "node:child_process";

import { PLAYER_FILE_PREFIX } from "#src/services/constants";
import { createAudioPlayer } from "#src/services/createAudioPlayer";
import { EventEmitter } from "node:events";
import { existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import { describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

// The player process as the test drives it: the paths written to its stdin, and its stdout for the test to answer on
const getPlayer = () => {
  const player = Object.assign(new EventEmitter(), { stdin: new PassThrough(), stdout: new PassThrough() });
  const paths: string[] = [];
  player.stdin.setEncoding("utf8");
  player.stdin.on("data", (chunk: string) => {
    paths.push(...chunk.split("\n").filter(Boolean));
  });
  spawn.mockReturnValueOnce(player as unknown as ReturnType<typeof baseSpawn>);
  return { paths, player };
};
const checkHasLeftovers = () => readdirSync(tmpdir()).some((name) => name.startsWith(PLAYER_FILE_PREFIX));

describe(createAudioPlayer, () => {
  test("spawns the player once with its window hidden, hands it each clip's path in turn, and deletes a clip once answered", async () => {
    expect.hasAssertions();

    const { paths, player } = getPlayer();
    const audioPlayer = createAudioPlayer();
    const first = audioPlayer.play(new Uint8Array());
    const second = audioPlayer.play(new Uint8Array());
    await setImmediate();

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn.mock.calls[0]?.[2]).toStrictEqual({ stdio: ["pipe", "pipe", "ignore"], windowsHide: true });
    expect(paths).toHaveLength(2);
    expect(paths.every((path) => existsSync(path))).toBe(true);

    player.stdout.write("\r\n");

    await expect(first).resolves.toBe("");
    expect(existsSync(paths[0] ?? "")).toBe(false);

    player.stdout.write("the file is not a WAV\n");

    await expect(second).resolves.toBe("the file is not a WAV");
    expect(checkHasLeftovers()).toBe(false);
  });

  test("answers every clip with why the player could not be spawned", async () => {
    expect.hasAssertions();

    const { player } = getPlayer();
    const audioPlayer = createAudioPlayer();
    const first = audioPlayer.play(new Uint8Array());
    player.emit("error", new Error("createAudioPlayer"));

    await expect(first).resolves.toBe("createAudioPlayer");
    await expect(audioPlayer.play(new Uint8Array())).resolves.toBe("createAudioPlayer");
    expect(checkHasLeftovers()).toBe(false);
  });

  test.each([
    { emit: (player: EventEmitter) => player.emit("close", 1), expected: "the player exited 1", name: "exited" },
    {
      emit: (player: EventEmitter) => player.emit("close", null, "SIGKILL"),
      expected: "the player was stopped by SIGKILL",
      name: "was stopped",
    },
  ])("answers what a player that $name part way left unplayed", async ({ emit, expected }) => {
    expect.hasAssertions();

    const { player } = getPlayer();
    const audioPlayer = createAudioPlayer();
    const first = audioPlayer.play(new Uint8Array());
    emit(player);

    await expect(first).resolves.toBe(expected);
    expect(checkHasLeftovers()).toBe(false);
  });

  test("ends the player's stdin on close and waits for it to exit", async () => {
    expect.hasAssertions();

    const { player } = getPlayer();
    const closed = createAudioPlayer().close();

    expect(player.stdin.writableEnded).toBe(true);

    player.emit("close", 0);

    await expect(closed).resolves.toBeUndefined();
  });
});
