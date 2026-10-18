import { props } from "#src/components/SpiralAbyss/Benediction/Index.fixture";
import SpiralAbyssBenediction from "#src/components/SpiralAbyss/Benediction/Index.vue";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("spiralAbyssBenediction", () => {
  test("a Corridor chamber offers its blessing choices", async () => {
    expect.hasAssertions();

    const onChoose = vi.fn<(towerBuffId: number) => void>();
    render(SpiralAbyssBenediction, { attrs: { onChoose }, props });
    const names = props.choices.map(({ descriptionTextHash }) => props.nameText[String(descriptionTextHash)]);
    await Promise.all(
      names.map(async (name) => {
        await expect.element(page.getByRole("button", { name })).toBeVisible();
      }),
    );
    await page.getByRole("button", { name: takeOne(names, 1) }).click();

    expect(onChoose).toHaveBeenCalledExactlyOnceWith(takeOne(props.choices, 1).towerBuffId);
  });
});
