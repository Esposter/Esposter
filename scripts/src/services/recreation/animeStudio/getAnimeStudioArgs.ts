// The arguments every AnimeStudio run is given after its own: the game key, and what it logs
export const getAnimeStudioArgs = (args: string[], game: string): string[] => [
  ...args,
  "--game",
  game,
  "--logger_flags",
  "Warning",
  "Error",
];
