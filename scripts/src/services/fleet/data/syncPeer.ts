import type { FileEntry } from "#src/models/fleet/data/FileEntry";
import type { Peer } from "#src/models/fleet/data/Peer";

import { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import { SUCCESS_EXIT_CODE } from "#src/services/fleet/data/constants";
import { formatTransferSummary } from "#src/services/fleet/data/formatTransferSummary";
import { getChangedDirectories } from "#src/services/fleet/data/getChangedDirectories";
import { getManifest } from "#src/services/fleet/data/getManifest";
import { getTransferCommands } from "#src/services/fleet/data/getTransferCommands";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { readRemoteListings } from "#src/services/fleet/data/readRemoteListings";
import { readRemoteManifest } from "#src/services/fleet/data/readRemoteManifest";
import { selectChangedFiles } from "#src/services/fleet/data/selectChangedFiles";
import { waitForExit } from "#src/services/fleet/data/waitForExit";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join, posix } from "node:path";
import { pipeline } from "node:stream/promises";

// Copies what the receiving side lacks, in the direction given, or only counts it when dry: the two manifests name the
// Directories whose digests differ, the peer lists just those, and the files the receiver lacks go through one tar stream
export const syncPeer = async (
  direction: TransferDirection,
  peer: Peer,
  folders: string[],
  localDirectory: string,
  remoteDirectory: string,
  isDryRun: boolean,
): Promise<void> => {
  const isPull = direction === TransferDirection.Pull;
  const localManifest = await getManifest(localDirectory, folders);
  const remoteManifest = await readRemoteManifest(peer, remoteDirectory, folders);
  const directories = isPull
    ? getChangedDirectories(remoteManifest, localManifest)
    : getChangedDirectories(localManifest, remoteManifest);
  const selectedPaths: string[] = [];
  let bytes = 0;
  if (directories.length > 0)
    for await (const listing of readRemoteListings(peer, remoteDirectory, directories)) {
      const localFiles = (await readDirectory(join(localDirectory, listing.directory))).files;
      const changedFiles: FileEntry[] = isPull
        ? selectChangedFiles(listing.files, localFiles)
        : selectChangedFiles(localFiles, listing.files);
      for (const file of changedFiles) {
        selectedPaths.push(posix.join(listing.directory, file.name));
        bytes += file.size;
      }
    }

  const label = `${direction.toLowerCase()} ${peer.host}`;
  if (isDryRun) {
    console.info(`${label} (dry run): ${selectedPaths.length} files, ${bytes} bytes would move`);
    return;
  }
  if (selectedPaths.length === 0) {
    console.info(`${label}: nothing to copy`);
    return;
  }

  // Tar unpacks only into a directory that exists, and a pull may be the first to fill this one
  if (isPull) await mkdir(localDirectory, { recursive: true });
  const [sourceCommand, targetCommand] = getTransferCommands(direction, peer, localDirectory, remoteDirectory);
  const source = spawn(sourceCommand.file, sourceCommand.args, { stdio: ["pipe", "pipe", "inherit"] });
  const target = spawn(targetCommand.file, targetCommand.args, { stdio: ["pipe", "inherit", "inherit"] });
  const sourceExitCode = waitForExit(source);
  const targetExitCode = waitForExit(target);
  const startedAt = performance.now();
  source.stdin.end(`${selectedPaths.join("\n")}\n`);
  await pipeline(source.stdout, target.stdin);
  const [sourceCode, targetCode] = await Promise.all([sourceExitCode, targetExitCode]);
  if (sourceCode !== SUCCESS_EXIT_CODE || targetCode !== SUCCESS_EXIT_CODE)
    throw new InvalidOperationError(Operation.Update, peer.host, `the transfer exited ${sourceCode} and ${targetCode}`);
  console.info(`${label}: ${formatTransferSummary(selectedPaths.length, bytes, performance.now() - startedAt)}`);
};
