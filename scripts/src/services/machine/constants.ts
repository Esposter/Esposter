import { KIBIBYTE } from "@esposter/configuration";
import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The thresholds the watcher decides a state by, and the output it wakes the session with
export const CPU_TARGET_PERCENTAGE = 80;
export const WINDOW_MINUTES = 3;
// The memory gate and the idle room are shares of the machine's own RAM, an eighth and three sixteenths, so a 32 GB
// Machine gets 4 and 6 GB and a 16 GB one 2 and 3 GB
export const GATE_MEMORY_SHARE = 0.125;
export const ROOM_MEMORY_SHARE = 0.1875;
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
export const SECONDS_PER_DAY: number = Temporal.Duration.from({ hours: 24 }).total("seconds");
// The watcher's latest reading, written each minute for the genshin-mods pulse and `pnpm ai:resume` to read. It is
// Written beside its file and renamed over it, and a reading older than the stale line is one the watcher missed
export const MACHINE_STATE_DIRECTORY: string = join(homedir(), `.${SITE_NAME.toLowerCase()}`, "machine");
export const MACHINE_STATE_PATH: string = join(MACHINE_STATE_DIRECTORY, "state.json");
export const MACHINE_STATE_NEXT_PATH: string = join(MACHINE_STATE_DIRECTORY, "state.next.json");
export const MACHINE_STATE_STALE_MILLISECONDS: number = Temporal.Duration.from({ minutes: 3 }).total("milliseconds");
// The watcher's claim on the machine, the one file a second watcher checks. It holds the watcher's process id, is created
// Exclusively and removed on exit, and is taken over only once that process is gone. The takeover lock lets one starter
// At a time take over a stale claim
export const MACHINE_LOCK_PATH: string = join(MACHINE_STATE_DIRECTORY, "watcher.lock");
export const MACHINE_LOCK_TAKEOVER_PATH: string = join(MACHINE_STATE_DIRECTORY, "watcher.lock.takeover");
