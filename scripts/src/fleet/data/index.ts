import { filesCommand } from "#src/fleet/data/filesCommand";
import { manifestCommand } from "#src/fleet/data/manifestCommand";
import { createTransferCommand } from "#src/fleet/data/transferCommand";
import { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:data` — the game data each machine of the fleet holds, copied over ssh on the local network only
// (the throughput skill, `references/fleet.md`, "Game data crosses the local network only")
await runMain(
  defineCommand({
    meta: {
      description: "Copy the game data between machines of the fleet over ssh on the local network",
      name: "ai:fleet:data",
    },
    subCommands: {
      files: filesCommand,
      manifest: manifestCommand,
      pull: createTransferCommand(TransferDirection.Pull, "Copy the files this machine lacks from a peer"),
      push: createTransferCommand(TransferDirection.Push, "Copy the files a peer lacks from this machine"),
    },
  }),
);
