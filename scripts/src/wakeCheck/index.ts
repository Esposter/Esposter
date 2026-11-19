import { getWakeGaps } from "#src/services/wakeCheck/getWakeGaps";
import { readWakeRecords } from "#src/services/wakeCheck/readWakeRecords";
import { runCommand } from "#src/services/timing/runCommand";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// The merged shards' records are the whole run's, so a procedure no shard calls is found here, where a sharded run cannot
await runCommand(
  defineCommand({
    meta: { description: "Fail when a watched procedure no suite of the merged shards calls", name: "wake-check:gaps" },
    run: () => {
      const records = readWakeRecords();
      if (records.length === 0)
        throw new InvalidOperationError(Operation.Read, "wake-check records", "no shard left one to check");
      const gaps = getWakeGaps(records);
      if (gaps.length > 0)
        throw new InvalidOperationError(Operation.Read, "watched procedures", `no suite calls ${gaps.join(", ")}`);
      console.log(`live topic wake check: ${records.length} files, no watched procedure without a call`);
    },
  }),
);
