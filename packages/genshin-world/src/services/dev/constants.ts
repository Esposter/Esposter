// A colour a variable takes as its text: a hash and six hexadecimal digits, as a colour is written in the game's own tables
export const HEX_COLOUR_REGEX = /^#[\da-f]{6}$/iu;
// A clock a console line gives as `HH:MM`, from `00:00` to `23:59`
export const DEV_CLOCK_TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/u;
export const MINUTES_PER_HOUR = 60;
// The digits a clock's hour and minute are written with, a zero padding the shorter one
export const CLOCK_FIELD_LENGTH = 2;
export const PERCENT = 100;
// The frame times the stats overlay's median covers, and how many frames pass between two of its readings
export const FRAME_STATS_HISTORY_LENGTH = 60;
export const FRAME_STATS_INTERVAL = 10;
