import { LEADING_SEGMENT_REGEX } from "../constants";

// A session chains `export` and `cd` ahead of its real command, so each leading segment is stripped before the
// Command's first word is read
export const stripLeadingSegments = (command: string): string => {
  const rest = command.replace(LEADING_SEGMENT_REGEX, "");
  return rest === command ? command : stripLeadingSegments(rest);
};
