import { props } from "#src/components/SpiralAbyss/Entry/Index.fixture";
import SpiralAbyssEntry from "#src/components/SpiralAbyss/Entry/Index.vue";
import { describe, expect, test } from "vitest";
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
});
