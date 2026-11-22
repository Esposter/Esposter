import { animateOrSkip } from "#src/services/dungeons/animation/animateOrSkip";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { describe, expect, test, vi } from "vitest";

// oxlint-disable-next-line vitest/prefer-import-in-mock -- The settings store loads Phaser, which the test environment cannot start
vi.mock("#src/store/dungeons/settings/index", async () => {
  // The flag is held in a ref, as the store holds its computed flag, so the suite reads it through storeToRefs
  const { ref } = await import("vue");
  const settingsMock = { isSkipAnimations: ref(false) };
  return { useSettingsStore: () => settingsMock };
});

describe(animateOrSkip, () => {
  test("plays the animation and not the end state while animations are on", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { isSkipAnimations } = storeToRefs(settingsStore);
    isSkipAnimations.value = false;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await animateOrSkip(animate, skip);

    expect(animate).toHaveBeenCalledTimes(1);
    expect(skip).not.toHaveBeenCalled();
  });

  test("applies the end state and not the animation while animations are off", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { isSkipAnimations } = storeToRefs(settingsStore);
    isSkipAnimations.value = true;
    const animate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const skip = vi.fn<() => void>();

    await animateOrSkip(animate, skip);

    expect(animate).not.toHaveBeenCalled();
    expect(skip).toHaveBeenCalledTimes(1);
  });
});
