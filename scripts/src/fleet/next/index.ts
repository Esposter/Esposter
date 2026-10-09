import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { createFleetWorker } from "#src/services/fleet/createFleetWorker";
import { checkIsFleetEntryKind, filterFleetEntries } from "#src/services/fleet/filterFleetEntries";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readFleetEntries } from "#src/services/fleet/readFleetEntries";
import { readRequiredMachineProfile } from "#src/services/fleet/readMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { selectTakeableEntries } from "#src/services/fleet/selectTakeableEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:next [--lane <lane>] [--kind <queue|unit>]` — claims the first entry this worker may take and prints its
// Id and the worker id, or prints nothing when none is takeable, which leaves the machine idle (the throughput skill,
// `references/fleet.md`). The worker id is FLEET_WORKER, or a new one when the environment gives none; a runner passes it
// To hold and release the entry. A runner names its lane, so a page runner never claims a cpu item; a skipped queue line is
// Warned about on stderr
await runMain(
  defineCommand({
    args: {
      kind: { default: "", description: "Only entries of this kind, queue or unit; any when empty", type: "string" },
      lane: {
        default: "",
        description: "Only queue items on this lane, such as page or cpu; any when empty",
        type: "string",
      },
    },
    meta: {
      description: "Claim the first entry this machine may take and print its id, or print nothing",
      name: "next",
    },
    run: async ({ args }) => {
      if (args.kind !== "" && !checkIsFleetEntryKind(args.kind))
        throw new InvalidOperationError(Operation.Read, args.kind, "--kind is queue or unit");
      const profile = readRequiredMachineProfile();
      const worker = process.env.FLEET_WORKER || createFleetWorker();
      const sample = await readMachineSample();
      const load = formatMachineLoad(
        sample.cpuPercentage,
        sample.gpuPercentage,
        sample.freeGigabytes,
        process.platform,
      );
      const { entries, skipped } = readFleetEntries();
      if (skipped > 0)
        console.warn(
          `skipped ${skipped} compute-queue line(s) with no {id}, so they cannot be taken until they have one`,
        );
      const candidates = selectTakeableEntries(
        filterFleetEntries(entries, args.lane, args.kind),
        profile,
        readClaimedRefs(),
        Temporal.Now.instant().epochMilliseconds,
      );
      for (const { id } of candidates)
        // oxlint-disable-next-line no-await-in-loop -- a candidate is claimed only after the one before it was refused
        if (claimFleetEntry(id, { machine: profile.id, worker }, load).attempt === ClaimAttempt.Won) {
          console.info(`claimed ${id} as worker ${worker}`);
          return;
        }
    },
  }),
);
