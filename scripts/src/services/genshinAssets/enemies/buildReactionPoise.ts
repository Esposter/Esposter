import { ReactionPoiseMap } from "#src/services/genshinAssets/enemies/ReactionPoiseMap";
import { GameDataset } from "genshin-world";

// The transformative reactions' poise, published beside the enemy kinds: one record per reaction the wiki gives poise
// For, keyed by its reaction type, with no record for a reaction it gives none. Returns the records the reaction table
// Publishes under
export const buildReactionPoise = (): Record<string, unknown> => ({
  [`${GameDataset.Enemies}/reactionPoise`]: Object.entries(ReactionPoiseMap).map(([reactionType, reactionPoise]) => ({
    ...reactionPoise,
    reactionType,
  })),
});
