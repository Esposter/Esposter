import type { VoiceLine } from "#src/models/VoiceLine";

// Lines that carry no voice of the character's own: how they feel about others, the daily greetings, the gift and
// Ascension acknowledgements
const SKIPPED_TITLE_REGEX =
  /^(?:About |More About|Feelings About|Good (?:Morning|Afternoon|Evening|Night)|Receiving a Gift|Birthday|Ascension)/u;

// A line a card is written from: the authoring command's cut, and only its, since the spinner shows every line
export const checkIsOwnVoiceLine = ({ title }: VoiceLine): boolean => !SKIPPED_TITLE_REGEX.test(title);
