import { GAME_VERSION_COMMAND_KINDS, UNLISTED_COMMAND_HEADING } from "#src/services/gameVersion/constants";

// The heading a stamped command is planned under: that of the first kind whose pattern it matches
export const findCommandHeading = (command: string): string =>
  GAME_VERSION_COMMAND_KINDS.find(({ pattern }) => pattern.test(command))?.heading ?? UNLISTED_COMMAND_HEADING;
