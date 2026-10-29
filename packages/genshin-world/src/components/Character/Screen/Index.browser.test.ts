import { props, twoSetsProps } from "#src/components/Character/Screen/Index.fixture";
import CharacterScreenContainer from "#src/components/Character/Screen/Index.vue";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";

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
});
