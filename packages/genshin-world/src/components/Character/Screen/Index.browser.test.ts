import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { props, twoSetsProps } from "#src/components/Character/Screen/Index.fixture";
import CharacterScreenContainer from "#src/components/Character/Screen/Index.vue";
import CharacterTerms from "#src/components/Character/Terms/Index.vue";
import { CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { h } from "vue";

describe("characterScreen", () => {
  // Its frame is wider than 16:9, so the window it is drawn in must hold the rightmost of its pieces
  test("the character screen's pieces stay inside the window's width", async () => {
    expect.hasAssertions();

    const { container } = await render(CharacterScreenContainer, { props });

    const rightmostEdge = Math.max(
      ...[...container.querySelectorAll("*")].map((element) => element.getBoundingClientRect().right),
    );
    expect(rightmostEdge).toBeLessThanOrEqual(window.innerWidth);
  });

  // Two pieces each of two sets: both sets' names draw above their bonuses, not only the first set's name
  test("each set the worn artifacts make shows its own name", async () => {
    expect.hasAssertions();

    await render(CharacterScreenContainer, { props: twoSetsProps });

    await expect.element(page.getByText("Scroll of the Hero of Cinder City", { exact: true })).toBeVisible();
    await expect.element(page.getByText("Gilded Dreams", { exact: true })).toBeVisible();
  });

  // The world mounts the terms in the screen's slot, which the screen passes the character it shows: the terms are the
  // Pack's, read from the reader of that character
  test("the terms of the shown character's pack come from its reader", async () => {
    expect.hasAssertions();

    const termsText = "The model's terms, shown as the pack bundles them.";
    const characterPackReader: CharacterPackReader = {
      characterId: props.activeCharacterId,
      key: "",
      readFile: (path) => Promise.resolve(path === CHARACTER_TERMS_PATH ? new Blob([termsText]) : undefined),
    };

    await render(CharacterScreenContainer, {
      props,
      slots: {
        default: ({ characterId }: { characterId: number }) =>
          h(CharacterTerms, { characterId, characterPackReaders: new Map([[characterId, characterPackReader]]) }),
      },
    });

    await expect.element(page.getByText(termsText, { exact: true })).toBeVisible();
  });
});
