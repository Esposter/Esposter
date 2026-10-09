// The macOS tool for starting a program under a QoS clamp, which every process the program starts inherits
const TASKPOLICY_PATH = "/usr/sbin/taskpolicy";

// A batch program and its arguments as they are spawned: on macOS under the utility QoS clamp, so the scheduler keeps it
// Behind the user's foreground apps, and elsewhere as given
export const getUtilityClampedCommand = (
  command: string,
  args: readonly string[],
): { args: string[]; command: string } =>
  process.platform === "darwin"
    ? { args: ["-c", "utility", command, ...args], command: TASKPOLICY_PATH }
    : { args: [...args], command };
