import { createStatCommand } from "#src/services/dev/commands/createStatCommand";
import { describe, expect, test, vi } from "vitest";

describe(createStatCommand, () => {
  test("stat on shows the overlay", () => {
    expect.hasAssertions();

    const setStatShown = vi.fn<(isShown: boolean) => void>();
    const result = createStatCommand({ setStatShown }).run({ state: "on" });

    expect(result).toStrictEqual({ ok: true, value: true });
    expect(setStatShown).toHaveBeenCalledExactlyOnceWith(true);
  });

  test("Toggle hides it", () => {
    expect.hasAssertions();

    const setStatShown = vi.fn<(isShown: boolean) => void>();
    const result = createStatCommand({ setStatShown }).run({ state: "off" });

    expect(result).toStrictEqual({ ok: true, value: false });
    expect(setStatShown).toHaveBeenCalledExactlyOnceWith(false);
  });
});
