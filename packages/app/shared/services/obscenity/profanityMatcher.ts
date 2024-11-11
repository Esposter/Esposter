import { englishDataset, englishRecommendedTransformers, RegExpMatcher } from "obscenity";

export const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});
