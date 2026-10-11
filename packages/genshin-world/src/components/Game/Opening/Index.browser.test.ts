import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import GameOpening from "#src/components/Game/Opening/Index.vue";
import { MARKS_FADE_MS, WHITE_HOLD_MS } from "#src/services/loading/constants";
import {
  LOGIN_DOOR_AFTER_LOAD_MS,
  LOGIN_MUSIC_RECORDING_DIRECTORY,
  LOGIN_PROGRESS_FILL_MS,
  LOGIN_STATUS_STEPS,
  LOGIN_TITLE_START_MS,
} from "#src/services/login/constants";
import { computeLoginDoorLiftMs } from "#src/services/login/door/computeLoginDoorLiftMs";
import { readLoginData } from "#src/services/login/readLoginData";
import { LOGIN_GLIDE_TITLE_SPEED } from "#src/services/login/scene/constants";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { readTitleLogoPath } from "#src/services/splash/readTitleLogoPath";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";
import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

// The opening's own reads made first, so each of its reads is answered by the page's one fetch of it within a frame of
// Its mount rather than whenever the mirror answers
const [, { door, scroll }] = await Promise.all([
  readTitleLogoPath(GAME_DATA_LOCAL_BASE_URL, GameLanguageTitleLogoMap[GameLanguage.English]),
  readLoginData(GAME_DATA_LOCAL_BASE_URL),
]);

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
    (scroll.LoginScene_Bridge01_Vo.length / LOGIN_GLIDE_TITLE_SPEED) * 1000 + computeLoginDoorLiftMs(door);

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // The title logo and the login's records are read from the hosted game data, so until they arrive the opening holds
  // The white its splashes play on rather than a title splash with no logo
  test("holds the splashes' white while its reads are in flight", async () => {
    expect.hasAssertions();

    // Every fetch held, under a base the page has read nothing from, so no read is answered by one made before
    const { promise } = Promise.withResolvers<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => promise),
    );
    const { container } = await render(GameOpening, {
      props: {
        gameDataBaseUrl: "/held",
        gameText: ENGLISH_GAME_TEXT,
        language: GameLanguage.English,
        musicRecordingBaseUrl: LOGIN_MUSIC_RECORDING_DIRECTORY,
        progress: 1,
      },
    });

    expect(container.querySelector(".splash-sequence")).toBeNull();
    expect(container.querySelector(".game-screen")).not.toBeNull();
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
        props: {
          gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
          gameText: ENGLISH_GAME_TEXT,
          language: GameLanguage.English,
          musicRecordingBaseUrl: LOGIN_MUSIC_RECORDING_DIRECTORY,
          onFinish,
          progress: 1,
        },
      });
      // The title logo's read resolves on the page's own fetch of it before the next frame, and the first splash mounts
      await waitForRealFrame(requestRealFrame);
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
      // The entering stage reaches the interface through the screen's render and its own, and its fade starts once that
      // Render is drawn, a frame after the click
      await waitForRealFrame(requestRealFrame);
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
