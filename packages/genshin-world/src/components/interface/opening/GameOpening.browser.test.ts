import GameOpening from "#src/components/interface/opening/GameOpening.vue";
import { MARKS_FADE_MS, WHITE_HOLD_MS } from "#src/services/interface/loading/constants";
import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

// Every running animation played to its end, and the handoffs its end starts let run: a splash's animation settling
// Mounts the next screen, and a CSS animation's end fires its `animationend` on the next frame
const playAnimations = async (): Promise<void> => {
  const animations = window.document.getAnimations();
  for (const animation of animations) animation.finish();
  await Promise.all(animations.map(({ finished }) => finished));
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
  await nextTick();
};

describe("gameOpening", () => {
  const splashCount = 3;

  afterEach(() => {
    vi.useRealTimers();
  });

  // The game's opening end to end with the page already loaded, the order a console that loads quickly sees it in:
  // Each splash hands on to the next, the startup screen's marks are shown rather than skipped, and the opening
  // Finishes once they have faded and the white has held
  test("plays the splashes, shows the startup marks, then finishes", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ toFake: ["setTimeout"] });
    const { container, emitted } = await render(GameOpening, { props: { progress: 1 } });
    await nextTick();
    for (let splash = 0; splash < splashCount; splash++) {
      expect(container.querySelector(".splash-sequence")).not.toBeNull();

      // oxlint-disable-next-line no-await-in-loop -- each splash mounts only once the one before it has played
      await playAnimations();
    }
    const marks = container.querySelector(".startup-loading .marks");

    expect(marks?.classList.contains("complete")).toBe(false);

    await playAnimations();

    expect(marks?.classList.contains("complete")).toBe(true);
    expect(emitted("finish")).toBeUndefined();

    vi.advanceTimersByTime(MARKS_FADE_MS + WHITE_HOLD_MS);

    expect(emitted("finish")).toHaveLength(1);
  });
});
