import { InvalidOperationError, Operation } from "@esposter/shared";

// A fish's category is the feature tag its monster holds, which a tag-drawn fishing bait weights and draws the fish by.
// A fish holding none files in no category.
// One holding two is refused, since the table names no way to choose.
export const toFishCategory = (
  monsterId: number,
  fishTags: ReadonlySet<number>,
  weightedTags: ReadonlySet<number>,
): number | undefined => {
  const categories = [...fishTags].filter((tag) => weightedTags.has(tag));
  if (categories.length > 1)
    throw new InvalidOperationError(Operation.Read, String(monsterId), "holds more than one fishing category");
  return categories[0];
};
