import type { WishEventPage } from "#src/models/genshinAssets/wish/WishEventPage";

import { readEpochMilliseconds } from "#src/services/genshinAssets/wish/readEpochMilliseconds";
import { readFeaturedNames } from "#src/services/genshinAssets/wish/readFeaturedNames";
import { readKind } from "#src/services/genshinAssets/wish/readKind";
import { readParameter } from "#src/services/genshinAssets/wish/readParameter";
import { readParameters } from "#src/services/genshinAssets/wish/readParameters";
import { readTimeZone } from "#src/services/genshinAssets/wish/readTimeZone";
import { readValue } from "#src/services/genshinAssets/wish/readValue";
import { WishEventKindFeaturedParametersMap } from "#src/services/genshinAssets/wish/WishEventKindFeaturedParametersMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { sliceWikiTemplate } from "genshin-persona/src/services/sliceWikiTemplate.ts";

const TEMPLATE_START = "{{Wish\n";
const POOL_TEMPLATE_START = "{{Wish Pool\n";
// An event banner page read into its kind, its window and the names of its featured items, as its Item Pool names them
// For its kind. A page of another kind is not read and reads as undefined, while an event banner missing a field throws
// Rather than reading as a banner without it
export const parseWishPage = (title: string, wikitext: string): undefined | WishEventPage => {
  const template = sliceWikiTemplate(wikitext, TEMPLATE_START);
  if (template === "") throw new InvalidOperationError(Operation.Read, TEMPLATE_START, "is not on the page");

  const parameters = readParameters(template);
  const poolParameters = readParameters(sliceWikiTemplate(wikitext, POOL_TEMPLATE_START));
  const kind = readKind(title, parameters, poolParameters);
  if (kind === undefined) return undefined;

  const featuredParameters = WishEventKindFeaturedParametersMap[kind];
  // A page naming no offset, as the older banner pages do, is read at the Asia server's GMT+8
  const timeZone = readTimeZone(readValue(parameters, "time_start_offset") ?? "GMT+8");
  return {
    endTime: readEpochMilliseconds(readParameter(parameters, "time_end"), timeZone),
    fiveStarNames: readFeaturedNames(readParameter(poolParameters, featuredParameters.fiveStar)),
    fourStarNames: readFeaturedNames(readParameter(poolParameters, featuredParameters.fourStar)),
    kind,
    // A page marked with a second type is the second banner of its kind in its window, the first having no mark
    kindNumber: parameters.has("type2") ? 2 : 1,
    startTime: readEpochMilliseconds(readParameter(parameters, "time_start"), timeZone),
  };
};
