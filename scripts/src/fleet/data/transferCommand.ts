import type { TransferDirection } from "#src/models/fleet/data/TransferDirection";

import { DATA_FOLDERS, FAILURE_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { readPeer } from "#src/services/fleet/data/readPeer";
import { resolveFolders } from "#src/services/fleet/data/resolveFolders";
import { syncPeer } from "#src/services/fleet/data/syncPeer";
import { getResultAsync, noop } from "@esposter/shared";
import { defineCommand } from "citty";

// The `pull` and `push` commands: the same diff, copied the one way or the other
export const createTransferCommand = (direction: TransferDirection, description: string) =>
  defineCommand({
    args: {
      "dry-run": { default: false, description: "Print how many files would move and copy nothing", type: "boolean" },
      folders: {
        default: DATA_FOLDERS.join(","),
        description: "The comma-separated folders to copy, relative to the local and remote directories",
        type: "string",
      },
      into: {
        default: "",
        description: "A subfolder of the peer's parity directory the copy lands in, such as game",
        type: "string",
      },
      peer: { description: "The peer's name in ~/.esposter/peers.json", required: true, type: "positional" },
      source: { default: "", description: "A local folder to copy instead of the parity directory", type: "string" },
    },
    meta: { description, name: direction.toLowerCase() },
    run: async ({ args }) =>
      (
        await getResultAsync(async () => {
          const peer = await readPeer(args.peer);
          const remoteDirectory = args.into ? `${peer.parityDirectory}/${args.into}` : peer.parityDirectory;
          await syncPeer(
            direction,
            peer,
            resolveFolders(args.folders),
            args.source || getParityDirectory(),
            remoteDirectory,
            args["dry-run"],
          );
        })
      ).match(noop, (error) => {
        console.error(error);
        process.exitCode = FAILURE_EXIT_CODE;
      }),
  });
