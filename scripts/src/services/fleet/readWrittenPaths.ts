import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";

const WRITES_REGEX = /Writes (?<writes>.*)/u;
const SENTENCE_END_REGEX = /\.\s/u;
const PATH_REGEX = /[./]/u;

// The paths an item writes: the backticked tokens in the sentence its `Writes` opens, so a prose mention of a constant
// Is not a path. A token with neither a slash nor a dot is a name rather than a file, and is left out
export const readWrittenPaths = (rest: string): string[] => {
  const writesSentence = WRITES_REGEX.exec(rest)?.groups?.writes?.split(SENTENCE_END_REGEX)[0] ?? "";
  return getBacktickedTokens(writesSentence).filter((token) => PATH_REGEX.test(token));
};
