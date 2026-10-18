import CharacterPackLoader from "#src/components/Character/PackLoader/Index.vue";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("characterPackLoader", () => {
  test("a chosen character's terms show beside it", async () => {
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

    await expect.element(page.getByText(terms, { exact: true })).toBeVisible();
  });
});
