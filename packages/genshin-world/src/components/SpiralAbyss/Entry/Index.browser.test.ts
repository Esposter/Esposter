import { props } from "#src/components/SpiralAbyss/Entry/Index.fixture";
import SpiralAbyssEntry from "#src/components/SpiralAbyss/Entry/Index.vue";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("spiralAbyssEntry", () => {
  test("a Moon Spire chamber shows its period's blessing", async () => {
    expect.hasAssertions();

    render(SpiralAbyssEntry, { props });

    await expect.element(page.getByText(props.nameText[String(props.blessing.nameTextHash)])).toBeVisible();
    await expect.element(page.getByText(props.nameText[String(props.blessing.descriptionTextHash)])).toBeVisible();
  });
});
