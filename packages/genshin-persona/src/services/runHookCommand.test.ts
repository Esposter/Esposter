import type { registerQuietExit } from "#src/services/registerQuietExit";

import { runHookCommand } from "#src/services/runHookCommand";
import { defineCommand } from "citty";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/registerQuietExit"), () => ({ registerQuietExit: vi.fn<typeof registerQuietExit>() }));

describe(runHookCommand, () => {
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
});
