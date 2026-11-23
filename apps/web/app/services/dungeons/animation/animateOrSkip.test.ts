import { animateOrSkip } from "#src/services/dungeons/animation/animateOrSkip";
import { describe, expect, test, vi } from "vitest";

// The flag is held in a ref, as the store holds its computed flag, and the suite keeps the writable ref the double
// Hands out
const { isSkipAnimations } = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return { isSkipAnimations: ref(false) };
});
// The settings
// oxlint-disable-next-line vitest/prefer-import-in-mock -- store loads Phaser, which the test environment cannot start
vi.mock("#src/store/dungeons/settings/index", () => ({ useSettingsStore: () => ({ isSkipAnimations }) }));

describe(animateOrSkip, () => {
  test("plays the animation and not the end state while animations are on", async () => {
    expect.hasAssertions();

    isSkipAnimations.value = false;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await animateOrSkip(animate, skip);

    expect(animate).toHaveBeenCalledTimes(1);
    expect(skip).not.toHaveBeenCalled();
  });

  test("applies the end state and not the animation while animations are off", async () => {
    expect.hasAssertions();

    isSkipAnimations.value = true;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await animateOrSkip(animate, skip);

    expect(animate).not.toHaveBeenCalled();
    expect(skip).toHaveBeenCalledTimes(1);
  });
});
