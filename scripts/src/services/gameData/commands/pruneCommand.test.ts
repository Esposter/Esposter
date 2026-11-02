import { pruneCommand } from "#src/services/gameData/commands/pruneCommand";
import { defineCommand, runCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/runGit"), () => ({
  runGit: vi.fn<(args: string[]) => string>(() => {
    throw new Error(" ");
  }),
}));

describe("pruneCommand", () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  // A prune whose fetch fails deletes nothing, and a chain that runs after it must not read it as a prune that was done
  test("exits 1 when the fetch fails", async () => {
    expect.hasAssertions();

    await runCommand(defineCommand({ subCommands: { prune: pruneCommand } }), { rawArgs: ["prune"] });

    expect(process.exitCode).toBe(1);
  });
});
