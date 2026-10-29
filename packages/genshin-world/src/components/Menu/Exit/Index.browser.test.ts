import { props } from "#src/components/Menu/Exit/Index.fixture";
import MenuExit from "#src/components/Menu/Exit/Index.vue";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("menuExit", () => {
  test("the prompt asks the quit question", async () => {
    expect.hasAssertions();

    await render(MenuExit, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.QuitConfirmQuestion], { exact: true }))
      .toBeInTheDocument();
  });

  test("cancel returns to the menu", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    const onQuit = vi.fn<() => void>();
    await render(MenuExit, { attrs: { onClose, onQuit }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
    expect(onQuit).not.toHaveBeenCalled();
  });

  test("confirm leaves for the app's home", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    const onQuit = vi.fn<() => void>();
    await render(MenuExit, { attrs: { onClose, onQuit }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).click();

    expect(onQuit).toHaveBeenCalledExactlyOnceWith();
    expect(onClose).not.toHaveBeenCalled();
  });
});
