// The millisecond durations, derived rather than written as literals so the relationship between them is the
// Definition — the same shape the byte units take. Every duration in this repo is one of these times a count,
// Which is all `(n, unit)` ever computed, at the cost of a dependency, a plugin
// Registration and a module-scope side effect in every package that wanted a number.
//
// A year is 365 days and a month is not here at all, because neither is a duration: the length of both depends
// On which one you are in. Anything that needs that answer is doing calendar arithmetic on a date, not scaling
// A count, and belongs on a date library rather than here.
export const SECOND = 1000;
export const MINUTE: number = 60 * SECOND;
export const HOUR: number = 60 * MINUTE;
export const DAY: number = 24 * HOUR;
export const YEAR: number = 365 * DAY;
