import { genshinParityCommand } from "#src/services/genshinParity/commands/genshinParityCommand";
import { runCommand } from "citty";
import { describe, expect, test } from "vitest";

describe("traceCommand", () => {
  // The region the trace reads, given in full, from an image that does not exist: a pair refused before the trace never reads it
  const REGION_ARGS = ["missing.png", "0", "0", "1", "1"];

  test("refuses a key with no map before it traces anything", async () => {
    expect.hasAssertions();

    await expect(
      runCommand(genshinParityCommand, { rawArgs: ["trace", ...REGION_ARGS, "--key", "InterfaceIcon.Exit"] }),
    ).rejects.toThrowError("needs --into");
  });

  test("refuses a map with no key before it traces anything", async () => {
    expect.hasAssertions();

    await expect(
      runCommand(genshinParityCommand, { rawArgs: ["trace", ...REGION_ARGS, "--into", "TracedMarks.ts"] }),
    ).rejects.toThrowError("takes a --key");
  });
});
