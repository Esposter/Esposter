import { props } from "#src/components/Menu/Time/Index.fixture";
import MenuTime from "#src/components/Menu/Time/Index.vue";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("menuTime", () => {
  // The dial at rest lands half an hour on from the clock, the minute the world's clock is set to on confirm
  test("confirm sets the clock to the target", async () => {
    expect.hasAssertions();

    const onConfirm = vi.fn<(minutes: number) => void>();
    render(MenuTime, { attrs: { onConfirm }, props });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.TimeConfirm] }).click();

    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(630);
  });

  // The screen's own close returns to the world without a confirm, so the clock keeps its hour
  test("closing without confirming leaves the clock as it was", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    const onConfirm = vi.fn<(minutes: number) => void>();
    render(MenuTime, { attrs: { onClose, onConfirm }, props });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.Back] }).click();

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
