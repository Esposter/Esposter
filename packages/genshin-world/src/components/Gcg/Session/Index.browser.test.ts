import type { GcgGame } from "#src/models/gcg/GcgGame";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import { readGcgGame } from "#src/services/gcg/readGcgGame";
import { ENGLISH_GAME_TEXT, fillGameTextValues, GameLanguage, GameTextKey } from "genshin-text";
import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// The hosted games record holds no game, since no resident offers a duel yet, so the duel's game is the one a test hands
// The reader for its one case, and the decks it names are still read from the hosted game data
vi.mock(import("#src/services/gcg/readGcgGame"), async (importOriginal) => {
  const actual = await importOriginal();
  return { readGcgGame: vi.fn<(gameDataBaseUrl: string, gameId: number) => Promise<GcgGame>>(actual.readGcgGame) };
});

// A duel of the tutorial deck against deck 1 through the board's own buttons: the preparation confirmed, the first roll
// Passed, then the round ended, the opponent's turns taken by the scripted policy until the round's second roll opens
describe("gcgSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should open the next round through the board's buttons", async () => {
    expect.hasAssertions();

    const game: GcgGame = { enemyDeckId: 1, gamePlayerDeckId: 2, playerDeckId: 2 };
    vi.mocked(readGcgGame).mockResolvedValueOnce(game);
    render(GcgSession, {
      props: {
        gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
        gameId: 12,
        gameText: ENGLISH_GAME_TEXT,
        language: GameLanguage.English,
      },
    });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgConfirm] }).click();
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgReroll] }).click();
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgEndRound] }).click();

    await expect
      .element(page.getByText(fillGameTextValues(ENGLISH_GAME_TEXT[GameTextKey.GcgRoundTitle], 2)))
      .toBeVisible();
    await expect.element(page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgReroll] })).toBeVisible();
  });

  test("should leave when the duel fails to load", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const onLeave = vi.fn<() => void>();
    await new Promise<void>((resolve) => {
      onLeave.mockImplementation(resolve);
      render(GcgSession, {
        props: {
          gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
          gameId: -1,
          gameText: ENGLISH_GAME_TEXT,
          language: GameLanguage.English,
          onLeave,
        },
      });
    });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
