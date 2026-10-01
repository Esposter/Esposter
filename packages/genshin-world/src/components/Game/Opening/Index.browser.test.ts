import GameOpening from "#src/components/Game/Opening/Index.vue";
import { MARKS_FADE_MS, WHITE_HOLD_MS } from "#src/services/loading/constants";
import {
  LOGIN_DOOR_AFTER_LOAD_MS,
  LOGIN_PROGRESS_FILL_MS,
  LOGIN_STATUS_STEPS,
  LOGIN_TITLE_START_MS,
} from "#src/services/login/constants";
import { LOGIN_DOOR_RISE_KEYFRAMES } from "#src/services/login/door/constants";
import { LOGIN_GLIDE_TITLE_SPEED, LOGIN_WALKWAY_ROW } from "#src/services/login/scene/constants";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

// Waits on the browser's own frame, kept before the clock is faked: a CSS animation's or transition's end is sent on a
// Rendering frame, which the faked frame clock never reaches
const waitForRealFrame = (requestRealFrame: typeof window.requestAnimationFrame): Promise<void> =>
  new Promise((resolve) => {
    requestRealFrame(() => {
      resolve();
    });
  });
// Every running animation played to its end, and the handoffs its end starts let run: a splash's animation settling
// Mounts the next screen, and a CSS animation's or transition's end fires its event on the next frame
const playAnimations = async (requestRealFrame: typeof window.requestAnimationFrame): Promise<void> => {
  const animations = window.document.getAnimations();
  for (const animation of animations) animation.finish();
  await Promise.all(animations.map(({ finished }) => finished));
  await waitForRealFrame(requestRealFrame);
  await waitForRealFrame(requestRealFrame);
  await nextTick();
};

describe("gameOpening", () => {
  const splashCount = 3;
  // The frames the flight's loop needs past its length to see it has arrived, at the fake clock's 16 ms a frame
  const flightFrameMs = 100;
  // The flight draws its scene every frame of its length, which a headless browser renders slower than a screen
  const timeoutMs = 240_000;
  // The longest from the door being due to the door standing formed, which its click waits on: a copy of the walkway
  // At the glide's slowest pace before the door's copy reaches the walkway's far end, then the door's rise
  const doorArrivalMs =
    (LOGIN_WALKWAY_ROW.length / LOGIN_GLIDE_TITLE_SPEED) * 1000 + (LOGIN_DOOR_RISE_KEYFRAMES.at(-1)?.[0] ?? 0);

  afterEach(() => {
    vi.useRealTimers();
  });

  // The game's opening end to end with the page already loaded, the order a console that loads quickly sees it in:
  // Each splash hands on to the next, the login screen's title waits for a click, the camera flies to the door, which
  // Waits for another and fades into white, the startup screen's marks are shown rather than skipped, and the
  // Opening finishes once they have faded and the white has held
  test(
    "plays the splashes, the login's title, flight and door, the startup marks, then finishes",
    async () => {
      expect.hasAssertions();

      const requestRealFrame = window.requestAnimationFrame.bind(window);
      vi.useFakeTimers({ toFake: ["setTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
      const onFinish = vi.fn<() => void>();
      const { container } = await render(GameOpening, {
        props: { gameText: ENGLISH_GAME_TEXT, onFinish, progress: 1 },
      });
      await nextTick();
      for (let splash = 0; splash < splashCount; splash++) {
        expect(container.querySelector(".splash-sequence")).not.toBeNull();

        // oxlint-disable-next-line no-await-in-loop -- each splash mounts only once the one before it has played
        await playAnimations(requestRealFrame);
      }
      const loginScreen = container.querySelector<HTMLElement>(".login-screen");

      expect(loginScreen).not.toBeNull();

      await vi.advanceTimersByTimeAsync(LOGIN_TITLE_START_MS);

      expect(container.querySelector(".login-interface .title")).not.toBeNull();

      loginScreen?.click();
      await nextTick();
      const lastStep = LOGIN_STATUS_STEPS.at(-1);
      await vi.advanceTimersByTimeAsync(
        (lastStep?.ms ?? 0) + LOGIN_PROGRESS_FILL_MS + LOGIN_DOOR_AFTER_LOAD_MS + doorArrivalMs + flightFrameMs,
      );

      expect(container.querySelector(".login-interface .prompt")).not.toBeNull();

      loginScreen?.click();
      await nextTick();
      await playAnimations(requestRealFrame);
      const marks = container.querySelector(".startup-loading .marks");

      expect(marks?.classList.contains("complete")).toBe(false);

      await playAnimations(requestRealFrame);

      expect(marks?.classList.contains("complete")).toBe(true);
      expect(onFinish).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(MARKS_FADE_MS + WHITE_HOLD_MS + flightFrameMs);

      expect(onFinish).toHaveBeenCalledTimes(1);
    },
    timeoutMs,
  );
});
