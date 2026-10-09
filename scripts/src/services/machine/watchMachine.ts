import type { CpuTotals } from "#src/models/machine/CpuTotals";
import type { MachineState } from "#src/models/machine/MachineState";

import { RENEW_MILLISECONDS } from "#src/services/fleet/constants";
import { pushMachineHeartbeat } from "#src/services/fleet/pushMachineHeartbeat";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { LAUNCHD_PROCESS_ID, SAMPLE_MILLISECONDS, WINDOW_MINUTES } from "#src/services/machine/constants";
import { formatMachineFigures } from "#src/services/machine/formatMachineFigures";
import { getCpuPercentage } from "#src/services/machine/getCpuPercentage";
import { getCpuTotals } from "#src/services/machine/getCpuTotals";
import { getMachineLine } from "#src/services/machine/getMachineLine";
import { getMachineState } from "#src/services/machine/getMachineState";
import { readAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import { readGpuPercentage } from "#src/services/machine/readGpuPercentage";
import { readProcesses } from "#src/services/machine/readProcesses";
import { selectOrphans } from "#src/services/machine/selectOrphans";
import { sweepOrphans } from "#src/services/machine/sweepOrphans";
import { getResult } from "@esposter/shared";
import { cpus } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";

// Watches the machine for the session, one reading a minute, printing a line only when the state changes or an idle or
// Tight state's reminder falls due. It runs under Monitor, so each printed line wakes the session (the throughput skill)
export const watchMachine = async (): Promise<void> => {
  const cpuAverages: number[] = [];
  let previousTotals: CpuTotals = getCpuTotals(cpus());
  let lastState: MachineState | undefined;
  let minutesInState = 0;
  // The heartbeat is pushed on the first reading and then every renewal interval, leased from this machine's last commit
  let lastHeartbeatMilliseconds = 0;
  let lastHeartbeatSha: string | undefined;
  for (;;) {
    // oxlint-disable-next-line no-await-in-loop -- Each reading is one minute after the last, so the waits cannot overlap
    await sleep(SAMPLE_MILLISECONDS);
    const totals = getCpuTotals(cpus());
    cpuAverages.push(getCpuPercentage(previousTotals, totals));
    previousTotals = totals;
    if (cpuAverages.length > WINDOW_MINUTES) cpuAverages.shift();
    const cpuAveragePercentage = cpuAverages.reduce((total, average) => total + average, 0) / cpuAverages.length;
    // oxlint-disable-next-line no-await-in-loop -- Each reader runs once per minute, after the last
    const freeGigabytes = await readAvailableGigabytes();
    // oxlint-disable-next-line no-await-in-loop -- As above
    const gpuPercentage = await readGpuPercentage();
    // oxlint-disable-next-line no-await-in-loop -- As above
    const processes = await readProcesses();
    const adopterProcessId = process.platform === "darwin" ? LAUNCHD_PROCESS_ID : undefined;
    sweepOrphans(selectOrphans(processes, adopterProcessId));
    // A sample with no memory reading has no state to classify, so the watcher waits for the next one
    if (freeGigabytes === undefined) continue;

    const state = getMachineState(cpuAveragePercentage, cpuAverages.length, freeGigabytes);
    minutesInState = state === lastState ? minutesInState + 1 : 0;
    const line = getMachineLine(
      state,
      lastState,
      minutesInState,
      formatMachineFigures(cpuAveragePercentage, cpuAverages.length, gpuPercentage, freeGigabytes),
    );
    if (line !== undefined) console.info(line);
    lastState = state;
    const profile = readMachineProfile();
    const now = Temporal.Now.instant().epochMilliseconds;
    if (profile !== undefined && now - lastHeartbeatMilliseconds >= RENEW_MILLISECONDS) {
      lastHeartbeatMilliseconds = now;
      // A failed push is one line, and forgets the last commit, so the next push leases from the remote's own commit
      const heartbeatParentSha = lastHeartbeatSha;
      lastHeartbeatSha = getResult(() =>
        pushMachineHeartbeat(
          {
            at: Temporal.Now.instant().toString(),
            cpu: cpuAveragePercentage,
            freeMemory: freeGigabytes,
            ...(gpuPercentage === undefined ? {} : { gpu: gpuPercentage }),
            machine: profile.id,
            platform: process.platform,
          },
          heartbeatParentSha,
        ),
      ).match(
        (sha) => sha,
        (error) => {
          console.error(`heartbeat not pushed: ${error.message}`);
          return undefined;
        },
      );
    }
  }
};
