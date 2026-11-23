import { InvalidOperationError, Operation } from "@esposter/shared";

// A fish's category: the feature tag its monster holds that a tag-drawn fishing bait weights, the tag the bait draws
// The Fish by. A fish holding none files in no category, and one holding two is refused, since the table names no way
// To choose
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
