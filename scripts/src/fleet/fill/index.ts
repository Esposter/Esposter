import { claimFillEntries } from "#src/services/fleet/claimFillEntries";
import { claimNextFleetEntry } from "#src/services/fleet/claimNextFleetEntry";
import { createFleetWorker } from "#src/services/fleet/createFleetWorker";
import { getFillBrief } from "#src/services/fleet/getFillBrief";
import { getFillFilter } from "#src/services/fleet/getFillFilter";
import { getFillTarget } from "#src/services/fleet/getFillTarget";
import { parseFillKinds } from "#src/services/fleet/parseFillKinds";
import { startFleetHold } from "#src/services/fleet/startFleetHold";
import { readHoldFiles } from "#src/services/resume/readHoldFiles";
import { defineCommand, runMain } from "citty";
import { cpus } from "node:os";

// `pnpm ai:fleet:fill [--target <n>] [--kinds unit,cpu,page]` — keeps this machine's live claims at its target: it claims
// The next entry of each kind in turn, starts each claim's hold detached, and prints a brief per new claim for a haiku
// Agent. A kind with nothing takeable drops out of the turn, and the command prints "nothing ready" when it claimed
// Nothing. `--target 0` claims nothing and prints the live count (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: {
      kinds: {
        default: "unit,cpu,page",
        description: "The kinds to claim in turn: unit, cpu or page, each a lane of the compute queue",
        type: "string",
      },
      target: {
        default: "",
        description: "The live claims this machine keeps; its logical core count, capped at twenty, when empty",
        type: "string",
      },
    },
    meta: {
      description: "Claim entries until this machine holds its target, and print an agent brief for each new claim",
      name: "fill",
    },
    run: async ({ args }) => {
      const kinds = parseFillKinds(args.kinds);
      const target = getFillTarget(args.target, cpus().length);
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
