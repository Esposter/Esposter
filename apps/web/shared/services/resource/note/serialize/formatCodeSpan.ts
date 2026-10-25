import { BACKTICK_EDGE_REGEX, SPACE_EDGE_REGEX } from "#shared/services/resource/note/serialize/constants";
import { longestBacktickRun } from "#shared/services/resource/note/serialize/longestBacktickRun";

// A code span is fenced by a run of backticks longer than any the text holds
// It is padded when the text starts or ends with a backtick, or starts and ends with a space
export const formatCodeSpan = (text: string) => {
  const fence = "`".repeat(longestBacktickRun(text) + 1);
  return BACKTICK_EDGE_REGEX.test(text) || SPACE_EDGE_REGEX.test(text)
    ? `${fence} ${text} ${fence}`
    : `${fence}${text}${fence}`;
};
