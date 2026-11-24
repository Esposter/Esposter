import LoginStatus from "#src/components/Login/Status/Index.vue";
import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";

describe("loginStatus", () => {
  // The download's line stands over its share while bytes are fetched, the share to two places as the game shows it
  test("the download's line is shown over its share", async () => {
    expect.hasAssertions();

    const { container } = await render(LoginStatus, {
      props: {
        gameText: ENGLISH_GAME_TEXT,
        isDownloadFailed: false,
        progress: 0.9264,
        step: LoginStatusStep.Downloading,
      },
    });

    expect(container.querySelector(".text")?.textContent.trim()).toBe(ENGLISH_GAME_TEXT[GameTextKey.LoginDownloading]);
    expect(container.querySelector(".percent")?.textContent.trim()).toBe("92.64%");
  });

  // A pack that failed its attempts stops the launch loading bar on the game's failure line, and its retry is the one
  // Control the foot offers, so the player asks for the files not yet kept from there
  test("the failure line and the retry are shown on the launch loading bar", async () => {
    expect.hasAssertions();

    const onRetry = vi.fn<() => void>();
    const { container } = await render(LoginStatus, {
      props: {
        gameText: ENGLISH_GAME_TEXT,
        isDownloadFailed: true,
        onRetry,
        progress: 0.4,
        step: LoginStatusStep.LoadingData,
      },
    });

    expect(container.querySelector(".text")?.textContent.trim()).toBe(
      ENGLISH_GAME_TEXT[GameTextKey.ResourceDownloadFailed],
    );
    container.querySelector<HTMLButtonElement>("button")?.click();

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
});
