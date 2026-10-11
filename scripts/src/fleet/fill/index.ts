import { claimFillEntries } from "#src/services/fleet/claimFillEntries";
import { claimNextFleetEntry } from "#src/services/fleet/claimNextFleetEntry";
import { createFleetWorker } from "#src/services/fleet/createFleetWorker";
import { getFillBrief } from "#src/services/fleet/getFillBrief";
import { getFillFilter } from "#src/services/fleet/getFillFilter";
import { getFillKinds } from "#src/services/fleet/getFillKinds";
import { getFillTarget } from "#src/services/fleet/getFillTarget";
import { readMachineProfile } from "#src/services/fleet/readMachineProfile";
import { startFleetHold } from "#src/services/fleet/startFleetHold";
import { readHoldFiles } from "#src/services/resume/readHoldFiles";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { cpus } from "node:os";

// `pnpm ai:fleet:fill [--target <n>] [--kinds unit,cpu,page]` — keeps this machine's live claims at its target: it claims
// The next entry of each kind in turn, starts each claim's hold detached, and prints a brief per new claim for a haiku
// Agent. A kind with nothing takeable drops out of the turn, and the command prints "nothing ready" when it claimed
// Nothing. `--target 0` claims nothing and prints the live count. The target and kinds are the arguments, else the
// Profile's, else the logical cores capped at twenty and every kind (the throughput skill, `references/fleet.md`)
await runCommand(
  defineCommand({
    args: {
      kinds: {
        default: "",
        description:
          "The kinds to claim in turn: unit, cpu or page, each a lane of the compute queue; the profile's when empty",
        type: "string",
      },
      target: {
        default: "",
        description:
          "The live claims this machine keeps; the profile's target, else its logical core count capped at twenty, when empty",
        type: "string",
      },
    },
    meta: {
      description: "Claim entries until this machine holds its target, and print an agent brief for each new claim",
      name: "fill",
    },
    run: async ({ args }) => {
      const profile = readMachineProfile();
      const kinds = getFillKinds(args.kinds, profile?.fillKinds);
      const target = getFillTarget(args.target, profile?.fillTarget, cpus().length);
      const liveCount = readHoldFiles().filter(({ isRunning }) => isRunning).length;
      console.info(`${liveCount} live claim(s) of ${target} on this machine`);
      const claims = await claimFillEntries(target - liveCount, kinds, async (fillKind) => {
        const worker = createFleetWorker();
        const { kind, lane } = getFillFilter(fillKind);
        const entry = await claimNextFleetEntry(lane, kind, worker);
        return entry === undefined ? undefined : { entry, worker };
      });
      for (const { entry, worker } of claims) startFleetHold(entry.id, worker);
      if (claims.length === 0) console.info("nothing ready");
      else console.info(claims.map(({ entry, worker }) => getFillBrief(entry, worker)).join("\n\n"));
    },
  }),
);
