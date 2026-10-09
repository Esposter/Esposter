// The arguments every AnimeStudio run is given after its own: the game, and what it logs
export const getAnimeStudioArgs = (args: string[]): string[] => [
  ...args,
  "--game",
  "GI",
  "--logger_flags",
  "Warning",
  "Error",
];
