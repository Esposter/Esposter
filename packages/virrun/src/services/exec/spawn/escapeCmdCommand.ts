import { CMD_META_CHARACTERS_REGEX } from "#src/services/exec/spawn/constants";

// The command a cmd.exe line runs, with its metacharacters caret-escaped; a path with spaces is one word after this.
export const escapeCmdCommand = (command: string): string =>
  command.replaceAll(CMD_META_CHARACTERS_REGEX, "^$<character>");
