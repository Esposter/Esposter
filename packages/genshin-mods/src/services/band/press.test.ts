import type { EngineInterface } from "claude-code";

import { describe, expect, test, vi } from "vitest";

import { press } from "./press";

describe(press, () => {
  test("a rejected action is a toast naming the failure", async () => {
    expect.hasAssertions();

    const toast = vi.fn<(text: string) => void>();
    // The engine is one large interface, and a press reaches only its toast, so the double carries that alone
    const $ = { ui: { toast } } as unknown as EngineInterface;

    press($, () => Promise.reject(new Error("compact refused")))();
    // One timer boundary drains every microtask the settled press runs before its toast
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(toast).toHaveBeenCalledExactlyOnceWith("The action failed: Error: compact refused.");
  });
});
