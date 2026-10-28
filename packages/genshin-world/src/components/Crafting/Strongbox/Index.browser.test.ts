import { props } from "#src/components/Crafting/Strongbox/Index.fixture";
import CraftingStrongbox from "#src/components/Crafting/Strongbox/Index.vue";
import { takeOne } from "@esposter/shared";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("craftingStrongbox", () => {
  // A bag holding one more unlocked artifact than the strongbox takes: once three are picked the offering is ready, and
  // The fourth is held back with its button disabled rather than picked as well
  test("the offering takes no more artifacts than its strongbox needs", async () => {
    expect.hasAssertions();

    await render(CraftingStrongbox, {
      props: {
        ...props,
        inventory: {
          ...props.inventory,
          items: [...props.inventory.items, { ...takeOne(props.inventory.items), id: props.inventory.nextId }],
          nextId: props.inventory.nextId + 1,
        },
      },
    });
    const candidate = page.getByRole("button", { exact: true, name: props.names.TEST_PIECE });

    await candidate.nth(0).click();
    await candidate.nth(1).click();
    await candidate.nth(2).click();

    await expect.element(candidate.nth(3)).toBeDisabled();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MysticOfferingCreate] }))
      .toBeEnabled();
  });
});
