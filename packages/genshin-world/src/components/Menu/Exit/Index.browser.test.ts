import { props } from "#src/components/Menu/Exit/Index.fixture";
import MenuExit from "#src/components/Menu/Exit/Index.vue";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("menuExit", () => {
  test("the prompt opens over the menu at the game's scale", async () => {
    expect.hasAssertions();

    render(MenuExit, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.QuitConfirmQuestion], { exact: true }))
      .toBeInTheDocument();
    // The 2026 frame's proportions as fractions of the panel, so the check holds at any screen size
    const cancel = page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).element();
    const confirm = page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).element();
    const dialog = cancel.closest(".dialog");
    if (!dialog) throw new Error("the cancel choice is not inside the dialog");
    const panel = dialog.getBoundingClientRect();
    const cancelRect = cancel.getBoundingClientRect();
    const confirmRect = confirm.getBoundingClientRect();
    expect(cancelRect.width / panel.width).toBeCloseTo(390 / 960, 3);
    expect((cancelRect.left - panel.left) / panel.width).toBeCloseTo(70 / 960, 3);
    expect((confirmRect.left - panel.left) / panel.width).toBeCloseTo(500 / 960, 3);
    expect((cancelRect.top - panel.top) / panel.height).toBeCloseTo(498 / 606, 3);
  });

  test("cancel returns to the menu", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    const onQuit = vi.fn<() => void>();
    render(MenuExit, { attrs: { onClose, onQuit }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
    expect(onQuit).not.toHaveBeenCalled();
  });

  test("confirm leaves for the app's home", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    const onQuit = vi.fn<() => void>();
    render(MenuExit, { attrs: { onClose, onQuit }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).click();

    expect(onQuit).toHaveBeenCalledExactlyOnceWith();
    expect(onClose).not.toHaveBeenCalled();
  });
});
