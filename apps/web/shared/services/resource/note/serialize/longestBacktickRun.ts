import { BACKTICK_RUN_REGEX } from "#shared/services/resource/note/serialize/constants";

// Reduced rather than spread into Math.max, since a text with enough runs passes more arguments than the engine takes
export const longestBacktickRun = (text: string) =>
  Array.from(text.matchAll(BACKTICK_RUN_REGEX), ([run]) => run.length).reduce(
    (longest, length) => Math.max(longest, length),
    0,
  );
