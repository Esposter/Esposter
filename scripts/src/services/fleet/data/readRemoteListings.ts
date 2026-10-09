import type { DirectoryListing } from "#src/models/fleet/data/DirectoryListing";
import type { Peer } from "#src/models/fleet/data/Peer";

import { SUCCESS_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getFleetCommand } from "#src/services/fleet/data/getFleetCommand";
import { getSshArguments } from "#src/services/fleet/data/getSshArguments";
import { parseDirectoryListing } from "#src/services/fleet/data/parseDirectoryListing";
import { waitForExit } from "#src/services/fleet/data/waitForExit";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

// The peer's files in each of the directories, one line per directory and streamed, so the peer's listing never
// Waits on a whole copy in memory. The directories go over stdin, so a long list never meets an argument limit
export const readRemoteListings = async function* (
  peer: Peer,
  remoteDirectory: string,
  directories: string[],
): AsyncGenerator<DirectoryListing> {
  const child = spawn("ssh", getSshArguments(peer, getFleetCommand(peer, "files", remoteDirectory, "")), {
    stdio: ["pipe", "pipe", "inherit"],
  });
  const exitCode = waitForExit(child);
  child.stdin.end(directories.join("\n"));
  for await (const line of createInterface({ crlfDelay: Infinity, input: child.stdout }))
    yield parseDirectoryListing(line);
  if ((await exitCode) !== SUCCESS_EXIT_CODE)
    throw new InvalidOperationError(Operation.Read, peer.host, "its file listing could not be read over ssh");
};
