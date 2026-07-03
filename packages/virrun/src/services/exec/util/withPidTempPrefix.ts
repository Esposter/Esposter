// Build the mkdtemp prefix for a pid-tagged temp: a reap prefix (e.g. `upper.`, `upper.persist.`, `.tmp.`) plus the
// Current process's pid, so the created dir is `<reapPrefix><pid>.<mkdtempRandom>`. A concurrent run's reap reads the
// Owner pid back out (parseTempOwnerPid) and spares the temp while this process is alive, only reclaiming it once the
// Owner has died — replacing the old serial-execution assumption with process liveness.
export const withPidTempPrefix = (reapPrefix: string): string => `${reapPrefix}${process.pid}.`;
