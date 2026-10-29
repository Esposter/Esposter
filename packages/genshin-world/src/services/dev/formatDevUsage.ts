import type { DevCommand } from "#src/models/dev/DevCommand";

// The usage line a command is shown with: its name, then one angle-bracketed word per argument, in the order its schema lists them
export const formatDevUsage = (command: DevCommand): string =>
  [command.name, ...Object.keys(command.args.shape).map((key) => `<${key}>`)].join(" ");
