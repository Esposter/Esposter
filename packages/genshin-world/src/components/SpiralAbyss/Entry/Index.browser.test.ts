import { props } from "#src/components/SpiralAbyss/Entry/Index.fixture";
import SpiralAbyssEntry from "#src/components/SpiralAbyss/Entry/Index.vue";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("spiralAbyssEntry", () => {
  test("a Moon Spire chamber shows its period's blessing", async () => {
    expect.hasAssertions();

    render(SpiralAbyssEntry, { props });

    const nameTextOf = (textHash: number): string => {
      const text = props.nameText[String(textHash)];
      if (text === undefined) throw new Error(`No name text for ${textHash}`);
      return text;
    };
    await expect.element(page.getByText(nameTextOf(props.blessing.nameTextHash))).toBeVisible();
    await expect.element(page.getByText(nameTextOf(props.blessing.descriptionTextHash))).toBeVisible();
  });

  test("a floor, then one of its chambers, is picked to start it", async () => {
    expect.hasAssertions();

    const onChoose = vi.fn<(floorId: number, chamberId: number) => void>();
    render(SpiralAbyssEntry, { attrs: { onChoose }, props });
    await page.getByRole("button", { exact: true, name: "9" }).click();
    await page.getByRole("button", { exact: true, name: "2" }).click();

    expect(onChoose).toHaveBeenCalledExactlyOnceWith(
      takeOne(props.floors).id,
      takeOne(takeOne(props.floors).chambers, 1).id,
    );
  });
});
