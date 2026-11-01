import { props } from "#src/components/Menu/Time/Index.fixture";
import MenuTime from "#src/components/Menu/Time/Index.vue";
import { TIME_MINIMUM_ADVANCE_MINUTES } from "#src/services/menu/constants";
import { MINUTES_PER_DAY } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("menuTime", () => {
  // The dial at rest lands half an hour on from the clock, the minute the world's clock is set to on confirm
  test("confirm sets the clock to the target", async () => {
    expect.hasAssertions();

    const onConfirm = vi.fn<(minutes: number) => void>();
    await render(MenuTime, { attrs: { onConfirm }, props });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.TimeConfirm] }).click();

    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(630);
  });

  // The screen's own close returns to the world without a confirm, so the clock keeps its hour
  test("closing without confirming leaves the clock as it was", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    const onConfirm = vi.fn<(minutes: number) => void>();
    await render(MenuTime, { attrs: { onClose, onConfirm }, props });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.Back] }).click();

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  // The fixture's clock at ten in the morning puts the hour the dial points at on the same day
  test("the day under the hour reads Today while the hour falls on the clock's day", async () => {
    expect.hasAssertions();

    await render(MenuTime, { props });

    await expect.element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.TimeToday], { exact: true })).toBeVisible();
  });

  // A clock the minimum advance takes past midnight points the hour at the next day, which has no word drawn yet
  test("the day under the hour is not drawn once the hour falls on the next day", async () => {
    expect.hasAssertions();

    await render(MenuTime, { props: { ...props, clockMinutes: MINUTES_PER_DAY - TIME_MINIMUM_ADVANCE_MINUTES } });

    expect(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.TimeToday], { exact: true }).query()).toBeNull();
  });
});
