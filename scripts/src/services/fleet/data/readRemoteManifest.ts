import type { Manifest } from "#src/models/fleet/data/Manifest";
import type { Peer } from "#src/models/fleet/data/Peer";

import { SUCCESS_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getFleetCommand } from "#src/services/fleet/data/getFleetCommand";
import { getSshArguments } from "#src/services/fleet/data/getSshArguments";
import { parseManifest } from "#src/services/fleet/data/parseManifest";
import { waitForExit } from "#src/services/fleet/data/waitForExit";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";

// The peer's manifest for the folders, printed by its own `ai:fleet:data manifest`
export const readRemoteManifest = async (peer: Peer, remoteDirectory: string, folders: string[]): Promise<Manifest> => {
  const child = spawn(
    "ssh",
    getSshArguments(peer, getFleetCommand(peer, "manifest", remoteDirectory, ` --folders ${folders.join(",")}`)),
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  const exitCode = waitForExit(child);
  const output = Buffer.concat(await child.stdout.toArray()).toString("utf8");
  if ((await exitCode) !== SUCCESS_EXIT_CODE)
    throw new InvalidOperationError(Operation.Read, peer.host, "its manifest could not be read over ssh");
  return parseManifest(output);
};
