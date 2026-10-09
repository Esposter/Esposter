import type { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import type { SubCommandsDef } from "citty";

import { DATA_FOLDERS, FAILURE_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { readPeer } from "#src/services/fleet/data/readPeer";
import { resolveFolders } from "#src/services/fleet/data/resolveFolders";
import { syncPeer } from "#src/services/fleet/data/syncPeer";
import { getResultAsync, noop, SITE_NAME } from "@esposter/shared";
import { defineCommand } from "citty";

// The `pull` and `push` commands: the same diff, copied the one way or the other
export const createTransferCommand = (direction: TransferDirection, description: string): SubCommandsDef[string] =>
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
        description:
          "A subfolder of the peer's parity directory, such as game: where a push lands, and what a pull copies from",
        type: "string",
      },
      peer: {
        description: `The peer's name in ~/.${SITE_NAME.toLowerCase()}/peers.json`,
        required: true,
        type: "positional",
      },
      source: {
        default: "",
        description: "A local folder in place of the parity directory: what a push copies from, and where a pull lands",
        type: "string",
      },
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
