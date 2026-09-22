export const MESSAGE =
  "A date is computed from the epoch, never typed — `new Date(0)`, the epoch plus a Temporal duration, or `.toISOString()` of one; a value a parser reads by its shape stays in the epoch's own year. See the test-values skill.";
// The one year a typed calendar date may carry: a shape a parser or formatter reads is still spelled in the
// Epoch's own year, so a date anywhere else is data someone chose
export const EPOCH_YEAR = "1970";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const CALENDAR_DATE_REGEX: RegExp = /(?<!\d)(?<year>\d{4})-\d{2}-\d{2}(?!\d)/u;
// The Temporal types a string literal spells a date into; `Temporal.Duration.from("P1D")` is a length, not a date
export const TEMPORAL_DATE_TYPES: ReadonlySet<string> = new Set([
  "Instant",
  "PlainDate",
  "PlainDateTime",
  "PlainMonthDay",
  "PlainYearMonth",
  "ZonedDateTime",
]);
