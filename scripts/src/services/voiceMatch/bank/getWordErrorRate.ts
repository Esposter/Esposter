const NON_WORD_REGEX = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE_RUN_REGEX = /\s+/u;

const getWords = (text: string) =>
  text.toLowerCase().replaceAll(NON_WORD_REGEX, "").split(WHITESPACE_RUN_REGEX).filter(Boolean);

// The field's intelligibility measure: word edits between what was said and what was heard, over the words said.
// Case and punctuation are the transcriber's choices rather than the voice's, so they are stripped first
export const getWordErrorRate = (reference: string, hypothesis: string): number => {
  const referenceWords = getWords(reference);
  const hypothesisWords = getWords(hypothesis);
  let previousRow = Array.from({ length: hypothesisWords.length + 1 }, (_, index) => index);
  for (const [referenceIndex, referenceWord] of referenceWords.entries()) {
    const row = [referenceIndex + 1];
    for (const [hypothesisIndex, hypothesisWord] of hypothesisWords.entries()) {
      const substitution = (previousRow[hypothesisIndex] ?? 0) + (referenceWord === hypothesisWord ? 0 : 1);
      const insertion = (row[hypothesisIndex] ?? 0) + 1;
      const deletion = (previousRow[hypothesisIndex + 1] ?? 0) + 1;
      row.push(Math.min(substitution, insertion, deletion));
    }

    previousRow = row;
  }

  return (previousRow.at(-1) ?? 0) / (referenceWords.length || 1);
};
