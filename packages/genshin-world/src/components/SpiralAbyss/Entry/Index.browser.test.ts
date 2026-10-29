import { props } from "#src/components/SpiralAbyss/Entry/Index.fixture";
import SpiralAbyssEntry from "#src/components/SpiralAbyss/Entry/Index.vue";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

const nameTextOf = (textHash: number): string => {
  const text = props.nameText[String(textHash)];
  if (text === undefined) throw new Error(`No name text for ${textHash}`);
  return text;
};

describe("spiralAbyssEntry", () => {
  test("a Moon Spire chamber shows its period's blessing", async () => {
    expect.hasAssertions();

    await render(SpiralAbyssEntry, { props });

    await expect.element(page.getByText(nameTextOf(props.blessing.nameTextHash))).toBeVisible();
    await expect.element(page.getByText(nameTextOf(props.blessing.descriptionTextHash))).toBeVisible();
  });

  test("a floor, then one of its chambers, is picked to start it", async () => {
    expect.hasAssertions();

    const onChoose = vi.fn<(floorId: number, chamberId: number) => void>();
    await render(SpiralAbyssEntry, { attrs: { onChoose }, props });
    const floor = takeOne(props.floors);
    const chamber = takeOne(floor.chambers, 1);
    await page.getByRole("button", { exact: true, name: String(floor.index) }).click();
    await page.getByRole("button", { exact: true, name: String(chamber.index) }).click();

    expect(onChoose).toHaveBeenCalledExactlyOnceWith(floor.id, chamber.id);
  });
});
