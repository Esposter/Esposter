import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { formatAge } from "#src/services/fleet/formatAge";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { formatFleetTable } from "#src/services/fleet/formatFleetTable";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readFleetEntries } from "#src/services/fleet/readFleetEntries";
import { readMachineHeartbeats } from "#src/services/fleet/readMachineHeartbeats";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:status` — every machine's last sample, every claim's holder, age and state, and every unit waiting on a
// Blocker, fetched fresh with the pruned refs gone (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    meta: {
      description: "Print every machine's last sample, every claim's holder, age and state, and every waiting unit",
      name: "status",
    },
    run: () => {
      const now = Temporal.Now.instant().epochMilliseconds;
      const machines = Array.from(readMachineHeartbeats(), ([id, heartbeat]) => [
        id,
        formatMachineLoad(heartbeat.cpu, heartbeat.gpu, heartbeat.freeMemory),
        formatAge(now - Temporal.Instant.from(heartbeat.at).epochMilliseconds),
      ]);
      const claims = Array.from(readClaimedRefs(), ([entry, { message }]) => {
        const status = getClaimStatus(message, now);
        const state = status === ClaimStatus.Missed ? `miss: ${message.miss ?? ""}` : status.toLowerCase();
        return [
          entry,
          formatClaimHolder(message),
          formatAge(now - Temporal.Instant.from(message.renewedAt).epochMilliseconds),
          state,
        ];
      });
      const waiting = readFleetEntries()
        .entries.filter(({ waiting: blocker }) => blocker !== "")
        .map(({ id, waiting: blocker }) => [id, blocker]);
      console.info("machines");
      for (const line of formatFleetTable(["id", "last sample", "age"], machines)) console.info(line);
      console.info("\nclaims");
      for (const line of formatFleetTable(["entry", "holder", "age", "state"], claims)) console.info(line);
      console.info("\nwaiting");
      for (const line of formatFleetTable(["unit", "waiting on"], waiting)) console.info(line);
    },
  }),
);
