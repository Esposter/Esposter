// oxlint-disable no-restricted-properties -- the suite sets the argv a hook reads from process.argv itself
import type { registerQuietExit } from "#src/services/registerQuietExit";

import { runHookCommand } from "#src/services/runHookCommand";
import { defineCommand } from "citty";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/registerQuietExit"), () => ({ registerQuietExit: vi.fn<typeof registerQuietExit>() }));

describe(runHookCommand, () => {
  const ORIGINAL_ARGV = process.argv;

  afterEach(() => {
    process.argv = ORIGINAL_ARGV;
  });

  test("rejects with the command's own error rather than exiting", async () => {
    expect.hasAssertions();

    await expect(
      runHookCommand(
        defineCommand({
          run: () => {
            throw new Error("A viewer file that is not JSON");
          },
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: A viewer file that is not JSON]`);
  });

  test("prints the usage rather than running the command on --help", async () => {
    expect.hasAssertions();

    const run = vi.fn<() => void>();
    process.argv = ["", "hook", "--help"];

    await runHookCommand(defineCommand({ run }));

    expect(run).not.toHaveBeenCalled();
  });
});
