import type { Peer } from "#src/models/fleet/data/Peer";
import type { StampEntry } from "#src/models/fleet/data/StampEntry";

import { SUCCESS_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getFleetCommand } from "#src/services/fleet/data/getFleetCommand";
import { getSshArguments } from "#src/services/fleet/data/getSshArguments";
import { parseStampEntry } from "#src/services/fleet/data/parseStampEntry";
import { waitForExit } from "#src/services/fleet/data/waitForExit";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
import { createInterface } from "node:readline";

// The stamps among the paths a peer holds, printed by its own `ai:fleet:data stamps`. The paths go over stdin, as the
// Listings do, and a path the peer holds no stamp at prints nothing
export const readRemoteStamps = async (peer: Peer, remoteDirectory: string, paths: string[]): Promise<StampEntry[]> => {
  if (paths.length === 0) return [];
  const child = spawn("ssh", getSshArguments(peer, getFleetCommand(peer, "stamps", remoteDirectory, "")), {
    stdio: ["pipe", "pipe", "inherit"],
  });
  const exitCode = waitForExit(child);
  child.stdin.end(paths.join("\n"));
  const stamps: StampEntry[] = [];
  for await (const line of createInterface({ crlfDelay: Infinity, input: child.stdout }))
    stamps.push(parseStampEntry(line));
  if ((await exitCode) !== SUCCESS_EXIT_CODE)
    throw new InvalidOperationError(Operation.Read, peer.host, "its provenance stamps could not be read over ssh");
  return stamps;
};
