import CharacterPackLoader from "#src/components/Character/PackLoader/Index.vue";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("characterPackLoader", () => {
  test("shows the terms bundled with the model the character is drawn from", async () => {
    expect.hasAssertions();

    const key = "a";
    const terms = "b";
    render(CharacterPackLoader, {
      props: {
        characterId: 1,
        characterPackReader: { key, readFile: () => Promise.resolve(new Blob([terms])) },
        confirmRemoval: noop,
        gameDataBaseUrl: "",
        isCharacterPackKept: false,
        keepCharacterPack: () => Promise.resolve(),
      },
    });
    await page.getByRole("button", { name: "The model's terms" }).click();

    await expect.element(page.getByText(terms, { exact: true })).toBeVisible();
  });
});
