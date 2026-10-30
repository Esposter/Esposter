import type { DevCommand } from "#src/models/dev/DevCommand";

import { runDevCommand } from "#src/services/dev/runDevCommand";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

describe(runDevCommand, () => {
  const GIVE_ARGUMENTS = z.object({ count: z.coerce.number().int().min(1), item: z.string() });

  test("reads each word as the argument its command names in that place, not in the order its schema writes its keys", () => {
    expect.hasAssertions();

    const run = vi.fn<DevCommand<typeof GIVE_ARGUMENTS>["run"]>(() => ({ ok: true, value: 0 }));
    const command: DevCommand<typeof GIVE_ARGUMENTS> = {
      args: GIVE_ARGUMENTS,
      argumentNames: ["item", "count"],
      name: "give",
      run,
    };

    expect(runDevCommand(command, ["Mora", "100"])).toStrictEqual({ ok: true, value: 0 });
    expect(run).toHaveBeenCalledExactlyOnceWith({ count: 100, item: "Mora" });
  });
});
