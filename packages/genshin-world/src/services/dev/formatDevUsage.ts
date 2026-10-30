import type { DevCommand } from "#src/models/dev/DevCommand";

// The usage line a command is shown with: its name, then one angle-bracketed word per argument, in the order it names them
export const formatDevUsage = (command: DevCommand): string =>
  [command.name, ...command.argumentNames.map((argumentName) => `<${argumentName}>`)].join(" ");
