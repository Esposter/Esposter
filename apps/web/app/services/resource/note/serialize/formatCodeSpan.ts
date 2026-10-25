import { BACKTICK_EDGE_REGEX } from "@/services/resource/note/serialize/constants";
import { longestBacktickRun } from "@/services/resource/note/serialize/longestBacktickRun";

// A code span is fenced by a run of backticks longer than any the text holds, padded when the text starts or ends with one
export const formatCodeSpan = (text: string) => {
  const fence = "`".repeat(longestBacktickRun(text) + 1);
  return BACKTICK_EDGE_REGEX.test(text) ? `${fence} ${text} ${fence}` : `${fence}${text}${fence}`;
};
