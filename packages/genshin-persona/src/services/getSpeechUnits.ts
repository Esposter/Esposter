import { MAX_SPEECH_UNIT_CHARACTERS } from "#src/services/constants";
import { splitSentences } from "#src/services/splitSentences";

// The units a reply is read in: the first sentence alone, since it is the whole of what the person waits for before
// Hearing anything, then sentences packed up to the budget
export const getSpeechUnits = (prose: string): string[] => {
  const [first, ...rest] = splitSentences(prose);
  if (first === undefined) return [];

  const units = [first];
  let unit = "";
  for (const sentence of rest)
    if (unit && unit.length + sentence.length + 1 > MAX_SPEECH_UNIT_CHARACTERS) {
      units.push(unit);
      unit = sentence;
    } else unit = unit ? `${unit} ${sentence}` : sentence;

  if (unit) units.push(unit);
  return units;
};
