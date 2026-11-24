// The game writes a count into a line as `#1#`, after a colon, with the count's unit after it: `Moonfins Caught: #1#`,
// Or `... maintained for: #1# second(s)`. A screen that does not show the count takes the words before it, and a line
// With no count is kept whole
const COUNT_PLACEHOLDER_REGEX = /:?\s*#\d#.*$/u;

export const getGameTextWords = (text: string): string => text.replace(COUNT_PLACEHOLDER_REGEX, "");
