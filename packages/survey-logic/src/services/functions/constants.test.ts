import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";

import { describe } from "vitest";

// The clock the date functions are tested at: Friday the second of January 1970 at one in the afternoon, in local time.
// Local time keeps a day or an hour read from it the same in every zone the suite runs in.
const TEST_NOW: Date = new Date(1970, 0, 2, 13);
export const TEST_CONTEXT: SurveyLogicContext = { now: TEST_NOW, scopes: {}, values: {} };

// The epoch's calendar day, the one date a test writes; every other date a test needs is this day moved by a duration
const epochDate: Temporal.PlainDate = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate();
export const TEST_EPOCH_DATE: string = epochDate.toString();
// Thirty-six years before the epoch, so its age at the test clock is thirty-six years
export const TEST_BIRTHDATE: string = epochDate.subtract({ years: 36 }).toString();
// Two days after the test birthdate, so at the test clock its birthday is still to come and its age is one year short
export const TEST_LATER_BIRTHDATE: string = epochDate.subtract({ years: 36 }).add({ days: 2 }).toString();
export const TEST_NEXT_YEAR_DATE: string = epochDate.add({ years: 1 }).toString();
// The day the United States' clocks went forward in the epoch's year, when two o'clock is skipped in Los Angeles
export const TEST_DAYLIGHT_GAP_DATE: string = epochDate.add({ days: 115 }).toString();
// Year zero is a leap year, so its first day and the first day of its successor are three hundred and sixty-six days apart
export const TEST_YEAR_ZERO_DATE: string = Temporal.PlainDate.from({ year: 0, month: 1, day: 1 }).toString();
export const TEST_YEAR_ZERO_MARCH_DATE: string = Temporal.PlainDate.from({ year: 0, month: 3, day: 1 }).toString();
export const TEST_YEAR_ONE_DATE: string = Temporal.PlainDate.from({ year: 1, month: 1, day: 1 }).toString();

// A matrix's items, each holding a numeric field, a text that reads as a number, a text that reads as none, an empty
// Field, and a missing one
export const SURVEY_ITEMS: SurveyLogicRecord[] = [
  { name: "a", price: 2, q: "3" },
  { name: "b", price: 5, q: "x" },
  { name: "c", price: "" },
  { name: "d", price: -1 },
];

describe.todo("constants");
