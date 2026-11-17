import { animateOrSkip } from "#src/services/dungeons/animation/animateOrSkip";
import { describe, expect, test, vi } from "vitest";

const { settingsStore } = vi.hoisted(() => ({ settingsStore: { isSkipAnimations: false } }));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- The settings store loads Phaser, which the test environment cannot start
vi.mock("#src/store/dungeons/settings/index", () => ({ useSettingsStore: () => settingsStore }));

describe(animateOrSkip, () => {
  test("plays the animation and not the end state while animations are on", async () => {
    expect.hasAssertions();

    settingsStore.isSkipAnimations = false;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await animateOrSkip(animate, skip);

    expect(animate).toHaveBeenCalledTimes(1);
    expect(skip).not.toHaveBeenCalled();
  });

  test("applies the end state and not the animation while animations are off", async () => {
    expect.hasAssertions();

    settingsStore.isSkipAnimations = true;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await animateOrSkip(animate, skip);

    expect(animate).not.toHaveBeenCalled();
    expect(skip).toHaveBeenCalledTimes(1);
  });
});
