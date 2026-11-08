import GcgScreenCard from "#src/components/Gcg/Screen/Card/Index.vue";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("gcgScreenCard", () => {
  const NAME = "Thunder and Eternity";
  const COST_COUNT = 2;

  // The card's name, then its dice cost worded by the game's label for it
  test("a card's name is read with its dice cost", async () => {
    expect.hasAssertions();

    await render(GcgScreenCard, {
      props: {
        costLabel: "Cost",
        costs: [{ count: COST_COUNT, kind: GcgCostKind.Unaligned }],
        isSelected: false,
        name: NAME,
      },
    });

    await expect
      .element(page.getByRole("button", { exact: true, name: `${NAME}, Cost ${COST_COUNT}` }))
      .toBeInTheDocument();
  });
});
