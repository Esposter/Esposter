import LoadingStartup from "#src/components/Loading/Startup/Index.vue";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";

describe("loadingStartup", () => {
  // The elemental screen reports the world's own load and nothing else: its bar is the progress it is handed, and it
  // Shows no words, so no download's bytes or line can reach it. The packs' download is on the launch loading bar
  test("the elemental loading screen shows no download progress", async () => {
    expect.hasAssertions();

    const { container } = await render(LoadingStartup, { props: { gameText: ENGLISH_GAME_TEXT, progress: 3 / 7 } });

    expect(container.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow")).toBe("43");
    expect(container.textContent).toBe("");
  });
});
