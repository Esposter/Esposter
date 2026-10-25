import { BACKTICK_RUN_REGEX } from "#shared/services/resource/note/serialize/constants";

export const longestBacktickRun = (text: string) =>
  Math.max(0, ...[...text.matchAll(BACKTICK_RUN_REGEX)].map(([run]) => run.length));
