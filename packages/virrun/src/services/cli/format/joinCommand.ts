// The display form of a command the CLI lines quote: an argv is space-joined, a pre-joined shell string is shown as
// It was given. Shared by every line that accepts the command shape persistWithCache holds (argv or string), so the
// Two never differ in how they render the same run.
export const joinCommand = (command: readonly string[] | string): string =>
  typeof command === "string" ? command : command.join(" ");
