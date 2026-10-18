import ShortcutWheel from "#src/components/Hud/ShortcutWheel/Index.vue";
import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { ShortcutWheelDirectionCountScreenKindsMap } from "#src/services/shortcutWheel/ShortcutWheelDirectionCountScreenKindsMap";
import { takeOne } from "@esposter/shared";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("shortcutWheel", () => {
  // The eight-direction wheel with no entry picked, so each of its eight defaults is drawn as an option named in English
  test("should draw each default entry as an option", async () => {
    expect.hasAssertions();

    render(ShortcutWheel, { directionCount: ShortcutWheelDirectionCount.Eight, gameText: ENGLISH_GAME_TEXT });

    await Promise.all(
      ShortcutWheelDirectionCountScreenKindsMap[ShortcutWheelDirectionCount.Eight].map(async (screenKind) => {
        await expect
          .element(page.getByRole("option", { name: ENGLISH_GAME_TEXT[ScreenKindGameTextKeyMap[screenKind]] }))
          .toBeInTheDocument();
      }),
    );
  });

  // The Wish entry picked, the top of the eight-direction wheel, so only that option is selected
  test("should select the picked entry alone", async () => {
    expect.hasAssertions();

    render(ShortcutWheel, {
      directionCount: ShortcutWheelDirectionCount.Eight,
      gameText: ENGLISH_GAME_TEXT,
      pickedIndex: 0,
    });

    const wishScreenKind = takeOne(
      takeOne(ShortcutWheelDirectionCountScreenKindsMap, ShortcutWheelDirectionCount.Eight),
    );
    await expect
      .element(
        page.getByRole("option", { name: ENGLISH_GAME_TEXT[ScreenKindGameTextKeyMap[wishScreenKind]], selected: true }),
      )
      .toBeInTheDocument();
  });
});
