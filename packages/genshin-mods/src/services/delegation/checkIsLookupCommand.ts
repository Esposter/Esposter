import { LEADING_SEGMENT_REGEX, LOOKUP_COMMAND_REGEX, WRITING_LOOKUP_REGEX } from "../constants";

// A session chains `export` and `cd` ahead of its real command, so each leading segment is stripped before the
// Command's first word is read
const stripLeadingSegments = (command: string): string => {
  const rest = command.replace(LEADING_SEGMENT_REGEX, "");
  return rest === command ? command : stripLeadingSegments(rest);
};

export const checkIsLookupCommand = (command: string): boolean => {
  const rest = stripLeadingSegments(command);

  return LOOKUP_COMMAND_REGEX.test(rest) && !WRITING_LOOKUP_REGEX.test(rest);
};
