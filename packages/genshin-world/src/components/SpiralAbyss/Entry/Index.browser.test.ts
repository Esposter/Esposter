import { props } from "#src/components/SpiralAbyss/Entry/Index.fixture";
import SpiralAbyssEntry from "#src/components/SpiralAbyss/Entry/Index.vue";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("spiralAbyssEntry", () => {
  test("a Moon Spire chamber shows its period's blessing", async () => {
    expect.hasAssertions();

    render(SpiralAbyssEntry, { props });

    await expect.element(page.getByText(props.nameText[String(props.blessing.nameTextHash)])).toBeVisible();
    await expect.element(page.getByText(props.nameText[String(props.blessing.descriptionTextHash)])).toBeVisible();
  });

  test("a floor, then one of its chambers, is picked to start it", async () => {
    expect.hasAssertions();

    const onChoose = vi.fn<(floorId: number, chamberId: number) => void>();
    render(SpiralAbyssEntry, { attrs: { onChoose }, props });
    await page.getByRole("button", { exact: true, name: "9" }).click();
    await page.getByRole("button", { exact: true, name: "2" }).click();

    expect(onChoose).toHaveBeenCalledExactlyOnceWith(props.floors[0].id, props.floors[0].chambers[1].id);
  });
});
