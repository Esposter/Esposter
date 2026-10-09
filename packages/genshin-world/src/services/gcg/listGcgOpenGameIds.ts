import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";

// The ids of a challenger's duels the Player Level has opened, each duel opened from the level that names it
export const listGcgOpenGameIds = (challengerGames: readonly GcgChallengerGame[], playerLevel: number): number[] =>
  challengerGames.filter(({ level }) => level <= playerLevel).map(({ gameId }) => gameId);
