import { KIBIBYTE } from "@esposter/configuration";

// The thresholds the watcher decides a state by, and the output it wakes the session with
export const CPU_TARGET_PERCENTAGE = 80;
export const WINDOW_MINUTES = 3;
export const GATE_GIGABYTES = 4;
export const ROOM_GIGABYTES = 6;
export const REMINDER_MINUTES = 15;
export const GIBIBYTE: number = KIBIBYTE ** 3;
export const SAMPLE_MILLISECONDS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// A reader's command is killed past half a sample, so a hung one cannot stall the watcher, and its output may run to a
// Busy machine's full process listing with every command line
export const COMMAND_TIMEOUT_MILLISECONDS: number = SAMPLE_MILLISECONDS / 2;
export const COMMAND_MAX_BUFFER_BYTES: number = 64 * KIBIBYTE ** 2;
// A process gets swept once it has burnt more than this many CPU seconds with no parent left to read its result
export const ORPHAN_CPU_SECONDS = 30;
// Matched without a path and without `.exe`, so `find` and `find.exe` both count
export const ORPHAN_NAMES: readonly string[] = ["du", "find", "grep", "rg"];
// The command line a swept orphan's output line shows, cut to this many characters
export const ORPHAN_COMMAND_LINE_CHARACTERS = 120;
// Windows reports process CPU time in 100-nanosecond ticks
export const WINDOWS_TICKS_PER_SECOND = 10_000_000;
// An orphan on macOS is reparented to launchd, which is always process 1
export const LAUNCHD_PROCESS_ID = 1;
export const SECONDS_PER_MINUTE: number = Temporal.Duration.from({ minutes: 1 }).total("seconds");
export const SECONDS_PER_DAY: number = Temporal.Duration.from({ hours: 24 }).total("seconds");
