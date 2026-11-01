import { WikiTypeWishEventKind } from "#src/models/genshinAssets/wish/WikiTypeWishEventKind";
import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";
import { checkHasFeaturedFiveStars } from "#src/services/genshinAssets/wish/checkHasFeaturedFiveStars";
import { readParameter } from "#src/services/genshinAssets/wish/readParameter";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The wiki's `type` for each event banner. Chronicled Wish and the standard wishes are not read by the schedule
const WikiTypeWishEventKindMap: Partial<Record<string, WishEventKind>> = {
  [WikiTypeWishEventKind.CharacterEvent]: WishEventKind.CharacterEvent,
  [WikiTypeWishEventKind.WeaponEvent]: WishEventKind.WeaponEvent,
};
// The kind of a page's banner. A page naming its type once is read as that type, and a page naming it more than once as
// The one type its Item Pool holds the featured five-stars of, refused when its pool holds neither of them or both
export const readKind = (
  title: string,
  parameters: Map<string, string[]>,
  poolParameters: Map<string, string[]>,
): undefined | WishEventKind => {
  const types = parameters.get("type") ?? [];
  if (types.length < 2) return WikiTypeWishEventKindMap[readParameter(parameters, "type")];

  const matchingKinds = new Set(
    types.flatMap((type) => {
      const kind = WikiTypeWishEventKindMap[type];
      return kind !== undefined && checkHasFeaturedFiveStars(poolParameters, kind) ? [kind] : [];
    }),
  );
  if (matchingKinds.size !== 1)
    throw new InvalidOperationError(
      Operation.Read,
      title,
      "names its type more than once, and its Item Pool does not match exactly one of them",
    );

  return [...matchingKinds][0];
};
