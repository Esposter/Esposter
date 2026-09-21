import { MAX_SPINNER_TIP_LENGTH } from "#src/services/constants";

// A sentence ends at an ASCII terminator followed by white space, or at one of the fullwidth terminators, which the
// Scripts that use them put no white space after — so a long line localizes without being dropped whole
const SENTENCE_END_REGEX = /[.!?](?=\s|$)|[。！？]/gu;

// A line as the spinner may show it: whole where it fits, else its opening sentences up to the last that does,
// Since the tool drops a longer tip outright and a twin's lines are whole dialogues; "" where not one sentence fits
export const cutSpinnerTip = (text: string): string => {
  if (text.length <= MAX_SPINNER_TIP_LENGTH) return text;

  const opening = text.slice(0, MAX_SPINNER_TIP_LENGTH);
  const sentenceEnds = Array.from(opening.matchAll(SENTENCE_END_REGEX), ({ index }) => index);
  const lastSentenceEnd = sentenceEnds.at(-1);
  return lastSentenceEnd === undefined ? "" : opening.slice(0, lastSentenceEnd + 1);
};
