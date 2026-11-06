import type { UiCommand } from "@/models/ui/UiCommand";

import { runCommand } from "@/services/ui/runCommand";
import { describe, expect, test, vi } from "vitest";

describe(runCommand, () => {
  test("a disabled command runs nothing, even when a shortcut reaches it", async () => {
    expect.hasAssertions();

    const run = vi.fn<() => void>();
    const command: UiCommand = { group: "", icon: "", id: "", isDisabled: true, run, title: "" };
    await runCommand(command);

    expect(run).not.toHaveBeenCalled();
  });
});
