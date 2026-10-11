import type { AnimeStudioBlockGuard } from "#src/models/recreation/animeStudio/AnimeStudioBlockGuard";

// The environment one game's AnimeStudio runs are given beside their arguments: the executable and the hint naming how
// It is found, the game key AnimeStudio reads it under, the asset index its readers look up and the command that writes
// It, and the guard refusing a run while the game holds its files
export interface AnimeStudioOptions {
  blockGuard?: AnimeStudioBlockGuard;
  executableHint: string;
  executablePath: string;
  game: string;
  indexCommand: string;
  indexPath: string;
}
