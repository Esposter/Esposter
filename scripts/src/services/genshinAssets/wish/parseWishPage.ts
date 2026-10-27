import type { WishEventPage } from "#src/models/genshinAssets/wish/WishEventPage";

import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { sliceWikiTemplate } from "genshin-persona/src/services/sliceWikiTemplate.ts";
import { WikiTypeWishEventKind } from "#src/models/genshinAssets/wish/WikiTypeWishEventKind";

const TEMPLATE_START = "{{Wish\n";
const POOL_TEMPLATE_START = "{{Wish Pool\n";
const OFFSET_REGEX = /^(?:GMT|UTC)(?<sign>[+-])(?<hours>\d{1,2})$/u;
// The wiki's `type` for each event banner. Chronicled Wish and the standard wishes are not read by the schedule
const WikiTypeWishEventKindMap: Partial<Record<string, WishEventKind>> = {
  [WikiTypeWishEventKind.CharacterEvent]: WishEventKind.CharacterEvent,
  [WikiTypeWishEventKind.WeaponEvent]: WishEventKind.WeaponEvent,
};
// The Item Pool's parameters that name each kind of banner's featured five-stars and featured four-stars
const WishEventKindFeaturedParametersMap: Record<WishEventKind, { fiveStar: string; fourStar: string }> = {
  [WishEventKind.CharacterEvent]: { fiveStar: "character_5_F", fourStar: "character_4_F" },
  [WishEventKind.WeaponEvent]: { fiveStar: "weapon_5_F", fourStar: "weapon_4_F" },
};

// Every value the template writes for each `name = value` parameter, in the order the page writes them, trimmed
const readParameters = (template: string): Map<string, string[]> => {
  const parameters = new Map<string, string[]>();
  for (const parameter of template.split("\n|").slice(1)) {
    const separator = parameter.indexOf("=");
    if (separator === -1) continue;

    const name = parameter.slice(0, separator).trim();
    parameters.set(name, [...(parameters.get(name) ?? []), parameter.slice(separator + 1).trim()]);
  }
  return parameters;
};

// The value a parameter reads as, its last one where the page writes it more than once
const readValue = (parameters: Map<string, string[]>, name: string): string | undefined => parameters.get(name)?.at(-1);

// A parameter a banner page must write, since a banner without it has no window, no kind or no featured items to read
const readParameter = (parameters: Map<string, string[]>, name: string): string => {
  const value = readValue(parameters, name);
  if (value === undefined) throw new InvalidOperationError(Operation.Read, name, "is not on the page");

  return value;
};

// The GMT or UTC offset a page writes its times at, as the zone it names: `GMT+8` and `UTC+8` are `+08:00`
const readTimeZone = (value: string): string => {
  const groups = OFFSET_REGEX.exec(value)?.groups;
  if (groups?.sign === undefined || groups.hours === undefined)
    throw new InvalidOperationError(Operation.Read, value, "is not a GMT offset");

  return `${groups.sign}${groups.hours.padStart(2, "0")}:00`;
};

// A wall-clock time the page writes, read in its own zone, as epoch milliseconds
const readEpochMilliseconds = (value: string, timeZone: string): number =>
  Temporal.PlainDateTime.from(value.replace(" ", "T")).toZonedDateTime(timeZone).epochMilliseconds;

// The names a featured parameter lists, `;`-separated, each trimmed and a stray separator leaving no name
const readFeaturedNames = (value: string): string[] =>
  value
    .split(";")
    .map((name) => name.trim())
    .filter((name) => name !== "");

// Whether an Item Pool holds the featured five-stars of a kind of banner, which is what settles a page's type
const checkHasFeaturedFiveStars = (poolParameters: Map<string, string[]>, kind: WishEventKind): boolean =>
  readFeaturedNames(readValue(poolParameters, WishEventKindFeaturedParametersMap[kind].fiveStar) ?? "").length > 0;

// The kind of a page's banner. A page naming its type once is read as that type, and a page naming it more than once as
// The one type its Item Pool holds the featured five-stars of, refused when its pool holds neither of them or both
const readKind = (
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
