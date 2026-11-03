import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";

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
