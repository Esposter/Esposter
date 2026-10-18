import { props } from "#src/components/Menu/Paimon/Index.fixture";
import MenuPaimon from "#src/components/Menu/Paimon/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("menuPaimon", () => {
  // The side bar's Settings entry opens the Settings screen, which the world's menu names by its own screen kind
  test("settings opens from the side bar", async () => {
    expect.hasAssertions();

    const onOpen = vi.fn<(screenKind: ScreenKind) => void>();
    render(MenuPaimon, {
      attrs: { onOpen },
      props: { ...props, isWorldLevelAdjustable: false, isWorldLevelLowered: false },
    });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.Settings] }).click();

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(ScreenKind.Settings);
  });
});
