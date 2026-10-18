import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";

import GcgScreen from "#src/components/Gcg/Screen/Index.vue";
import { props as screenFixtureProps } from "#src/components/Gcg/Screen/Index.fixture";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GCG_OPPONENT_SIDE_INDEX, GCG_PLAYER_SIDE_INDEX, GCG_TOSS_UP_CARD_ID } from "#src/services/gcg/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Toss-Up's name and description are made-up text ids, named by the test's own text map beside the fixture's
const TOSS_UP_NAME_TEXT_ID = 900_001;
const TOSS_UP_DESCRIPTION_TEXT_ID = 900_002;
// Toss-Up in the player's hand: an Event costing one Unaligned die, with no target to pick
const tossUpCard: GcgCard = {
  costs: [{ count: 1, kind: GcgCostKind.Unaligned }],
  descriptionTextId: TOSS_UP_DESCRIPTION_TEXT_ID,
  effects: [],
  id: GCG_TOSS_UP_CARD_ID,
  isLocation: false,
  kind: GcgCardKind.Event,
  nameTextId: TOSS_UP_NAME_TEXT_ID,
};
const { duel } = screenFixtureProps;

// The dice of the board's dice column by their index, clicked in the order the player picks them
const clickDie = (dieIndex: number) => {
  document.querySelectorAll<HTMLButtonElement>("button.die").item(dieIndex)?.click();
};
const renderScreenWithTossUp = (onPlayCard: (...args: unknown[]) => void) => {
  duel.sides[0].cards = [...duel.sides[0].cards, tossUpCard];
  duel.sides[0].hand = [GCG_TOSS_UP_CARD_ID];
  render(GcgScreen, {
    props: {
      ...screenFixtureProps,
      onPlayCard,
      textMap: { ...screenFixtureProps.textMap, [TOSS_UP_NAME_TEXT_ID]: "Toss-Up" },
    },
  });
};

// The duel board's Toss-Up: its payment is picked first, then the dice it rerolls, numbered among the dice its payment leaves
describe("gcgScreen", () => {
  test("should play Toss-Up with the dice it rerolls numbered among the dice left after its payment", async () => {
    expect.hasAssertions();

    const onPlayCard = vi.fn<(...args: unknown[]) => void>();
    renderScreenWithTossUp(onPlayCard);

    clickDie(0);
    await page.getByRole("button", { name: /Toss-Up/u }).click();
    clickDie(2);
    clickDie(4);
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgReroll] }).click();
    clickDie(5);
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgConfirm] }).click();

    const expectedChoice: GcgPlayChoice = { rerollDiceIndices: [[1, 3], [4]] };
    expect(onPlayCard.mock.calls).toStrictEqual([[0, undefined, [0], expectedChoice]]);
  });

  test("should leave Toss-Up unplayed when its choice is cancelled", async () => {
    expect.hasAssertions();

    const onPlayCard = vi.fn<(...args: unknown[]) => void>();
    renderScreenWithTossUp(onPlayCard);

    clickDie(0);
    await page.getByRole("button", { name: /Toss-Up/u }).click();
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onPlayCard).not.toHaveBeenCalled();
  });

  test("should leave the ended duel with the player's win once its confirm is pressed", async () => {
    expect.hasAssertions();

    const onLeave = vi.fn<(won: boolean) => void>();
    render(GcgScreen, {
      props: {
        ...screenFixtureProps,
        duel: { ...duel, phase: GcgPhase.Ended, winnerSideIndex: GCG_PLAYER_SIDE_INDEX },
        onLeave,
      },
    });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgConfirm] }).click();

    expect(onLeave.mock.calls).toStrictEqual([[true]]);
  });

  test("should leave the ended duel with the player's loss when the opponent won", async () => {
    expect.hasAssertions();

    const onLeave = vi.fn<(won: boolean) => void>();
    render(GcgScreen, {
      props: {
        ...screenFixtureProps,
        duel: { ...duel, phase: GcgPhase.Ended, winnerSideIndex: GCG_OPPONENT_SIDE_INDEX },
        onLeave,
      },
    });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgConfirm] }).click();

    expect(onLeave.mock.calls).toStrictEqual([[false]]);
  });
});
