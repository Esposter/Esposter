import { LOOKUP_COMMAND_REGEX, WRITING_LOOKUP_REGEX } from "../constants";
import { stripLeadingSegments } from "./stripLeadingSegments";

export const checkIsLookupCommand = (command: string): boolean => {
  const rest = stripLeadingSegments(command);

  return LOOKUP_COMMAND_REGEX.test(rest) && !WRITING_LOOKUP_REGEX.test(rest);
};
