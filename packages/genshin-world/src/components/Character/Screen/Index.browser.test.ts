import { props } from "#src/components/Character/Screen/Index.fixture";
import CharacterScreenContainer from "#src/components/Character/Screen/Index.vue";
import { describe, expect, test } from "vitest";
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
});
