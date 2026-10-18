import type { WishEventPage } from "#src/models/genshinAssets/wish/WishEventPage";

import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { sliceWikiTemplate } from "genshin-persona/src/services/sliceWikiTemplate.ts";

const TEMPLATE_START = "{{Wish\n";
const SUMMARY_HEADING_REGEX = /^===\s*Summary\s*===/mu;
const NEXT_HEADING_REGEX = /\n==/u;
const BULLET_PREFIX = "*";
const WISH_ITEM_REGEX = /\{\{Wish Item\|(?<names>[^}]*)\}\}/gu;
const OFFSET_REGEX = /^(?:GMT|UTC)(?<sign>[+-])(?<hours>\d{1,2})$/u;
// The wiki's `type` for each event banner. Chronicled Wish and the standard wishes are not read by the schedule
const WikiTypeWishEventKindMap: Partial<Record<string, WishEventKind>> = {
  "Character Event": WishEventKind.CharacterEvent,
  "Weapon Event": WishEventKind.WeaponEvent,
};

// Every `name = value` parameter of the template, each name and value trimmed as the wiki writes them
const readParameters = (template: string): Map<string, string> => {
  const parameters = new Map<string, string>();
  for (const parameter of template.split("\n|").slice(1)) {
    const separator = parameter.indexOf("=");
    if (separator === -1) continue;

    parameters.set(parameter.slice(0, separator).trim(), parameter.slice(separator + 1).trim());
  }
  return parameters;
};

// A parameter a banner page must write, since a banner without it has no window or no kind to read
const readParameter = (parameters: Map<string, string>, name: string): string => {
  const value = parameters.get(name);
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

// The bullet lines of the Summary, its section running to the next heading or to the end of the page
const readSummaryBullets = (wikitext: string): string[] => {
  const summaryHeading = SUMMARY_HEADING_REGEX.exec(wikitext);
  if (summaryHeading === null) throw new InvalidOperationError(Operation.Read, "Summary", "is not on the page");

  const section = wikitext.slice(summaryHeading.index + summaryHeading[0].length);
  const sectionEnd = section.search(NEXT_HEADING_REGEX);
  return section
    .slice(0, sectionEnd === -1 ? undefined : sectionEnd)
    .split("\n")
    .filter((line) => line.startsWith(BULLET_PREFIX));
};

// The names every `{{Wish Item}}` in one bullet names, `;`-separated within a marker and marker by marker in order
const readWishItemNames = (bullet: string): string[] =>
  Array.from(bullet.matchAll(WISH_ITEM_REGEX), ({ groups }) => groups?.names ?? "")
    .flatMap((names) => names.split(";"))
    .map((name) => name.trim())
    .filter((name) => name !== "");

// An event banner page read into its kind, its window and the names of its featured items. The first bullet of the
// Summary names the promotional five-stars and the second the featured four-stars. A page of another kind is not read
// And reads as undefined, while an event banner missing a field throws rather than reading as a banner without it
export const parseWishPage = (wikitext: string): WishEventPage | undefined => {
  const template = sliceWikiTemplate(wikitext, TEMPLATE_START);
  if (template === "") throw new InvalidOperationError(Operation.Read, TEMPLATE_START, "is not on the page");

  const parameters = readParameters(template);
  const kind = WikiTypeWishEventKindMap[readParameter(parameters, "type")];
  if (kind === undefined) return undefined;

  const [fiveStarBullet, fourStarBullet] = readSummaryBullets(wikitext);
  if (fiveStarBullet === undefined || fourStarBullet === undefined)
    throw new InvalidOperationError(Operation.Read, SUMMARY_HEADING, "has no two bullets of featured items");

  // A page naming no offset, as the older banner pages do, is read at the Asia server's GMT+8
  const timeZone = readTimeZone(parameters.get("time_start_offset") ?? "GMT+8");
  return {
    endTime: readEpochMilliseconds(readParameter(parameters, "time_end"), timeZone),
    fiveStarNames: readWishItemNames(fiveStarBullet),
    fourStarNames: readWishItemNames(fourStarBullet),
    kind,
    // A page marked with a second type is the second banner of its kind in its window, the first having no mark
    kindNumber: parameters.has("type2") ? 2 : 1,
    startTime: readEpochMilliseconds(readParameter(parameters, "time_start"), timeZone),
  };
};
