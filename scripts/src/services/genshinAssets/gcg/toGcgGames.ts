import type { ExcelGcgGameRow } from "#src/models/genshinAssets/gcg/ExcelGcgGameRow";
import type { GcgGame } from "genshin-world";

import { GCG_PLACEHOLDER_PLAYER_DECK_ID } from "#src/services/genshinAssets/gcg/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The games a world's residents play, each as a duel plays it. A game names its opponent's deck and the player's deck;
// The player's is the game's own only where a slice of it is written, and the placeholder deck otherwise
export const toGcgGames = (
  gameRows: ExcelGcgGameRow[],
  gameIds: number[],
  writtenDeckIds: number[],
): Record<string, GcgGame> =>
  Object.fromEntries(
    gameIds.map((gameId) => {
      const gameRow = gameRows.find(({ id }) => id === gameId);
      if (!gameRow) throw new InvalidOperationError(Operation.Read, "game", `the game table holds no game ${gameId}`);
      if (!writtenDeckIds.includes(gameRow.enemyCardGroupId))
        throw new InvalidOperationError(
          Operation.Read,
          "game",
          `game ${gameId} plays deck ${gameRow.enemyCardGroupId}, which no slice is written for`,
        );
      const isPlayerDeckWritten = writtenDeckIds.includes(gameRow.cardGroupId);
      return [
        String(gameId),
        {
          enemyDeckId: gameRow.enemyCardGroupId,
          gamePlayerDeckId: gameRow.cardGroupId,
          playerDeckId: isPlayerDeckWritten ? gameRow.cardGroupId : GCG_PLACEHOLDER_PLAYER_DECK_ID,
        },
      ];
    }),
  );
