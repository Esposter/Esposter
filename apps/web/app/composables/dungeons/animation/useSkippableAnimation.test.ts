import { useSkippableAnimation } from "@/composables/dungeons/animation/useSkippableAnimation";
import { describe, expect, test, vi } from "vitest";

const { settingsStore } = vi.hoisted(() => ({ settingsStore: { isSkipAnimations: false } }));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- The settings store loads Phaser, which the test environment cannot start
vi.mock("@/store/dungeons/settings", () => ({ useSettingsStore: () => settingsStore }));

describe(useSkippableAnimation, () => {
  test("plays the animation and not the end state while animations are on", async () => {
    expect.hasAssertions();

    settingsStore.isSkipAnimations = false;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await useSkippableAnimation(animate, skip);

    expect(animate).toHaveBeenCalledTimes(1);
    expect(skip).not.toHaveBeenCalled();
  });

  test("applies the end state and not the animation while animations are off", async () => {
    expect.hasAssertions();

    settingsStore.isSkipAnimations = true;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await useSkippableAnimation(animate, skip);

    expect(animate).not.toHaveBeenCalled();
    expect(skip).toHaveBeenCalledTimes(1);
  });
});
