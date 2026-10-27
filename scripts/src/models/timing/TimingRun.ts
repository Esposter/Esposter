import type { TimingArgs } from "#src/models/timing/TimingArgs";

// One run of a command line, as one line of its `{state-root}/timings/<command>.jsonl` log
export interface TimingRun {
  args: TimingArgs;
  command: string;
  date: string;
  exitCode: number;
  milliseconds: number;
}
