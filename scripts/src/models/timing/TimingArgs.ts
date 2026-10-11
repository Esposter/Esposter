// The shape of a command line as `~/.esposter/timings` records it: the flags it named and how many positionals it
// Carried, a value after a flag counted among them, so no argument's value is ever written to the log
export interface TimingArgs {
  flags: string[];
  positionals: number;
}
