import type { ChangedDirectory } from "#src/models/fleet/data/ChangedDirectory";
import type { Peer } from "#src/models/fleet/data/Peer";
import type { StampEntry } from "#src/models/fleet/data/StampEntry";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import { SUCCESS_EXIT_CODE } from "#src/services/fleet/data/constants";
import { formatTransferSummary } from "#src/services/fleet/data/formatTransferSummary";
import { getChangedDirectories } from "#src/services/fleet/data/getChangedDirectories";
import { getManifest } from "#src/services/fleet/data/getManifest";
import { getStampCandidates } from "#src/services/fleet/data/getStampCandidates";
import { getTransferCommands } from "#src/services/fleet/data/getTransferCommands";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { readLocalStamps } from "#src/services/fleet/data/readLocalStamps";
import { readRemoteListings } from "#src/services/fleet/data/readRemoteListings";
import { readRemoteManifest } from "#src/services/fleet/data/readRemoteManifest";
import { readRemoteStamps } from "#src/services/fleet/data/readRemoteStamps";
import { selectChangedFiles } from "#src/services/fleet/data/selectChangedFiles";
import { selectVouchedPaths } from "#src/services/fleet/data/selectVouchedPaths";
import { waitForExit } from "#src/services/fleet/data/waitForExit";
import { checkHasGameInstall } from "#src/services/genshinAssets/shared/checkHasGameInstall";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
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
  { isDryRun }: DryRunOptions,
): Promise<void> => {
  const isPull = direction === TransferDirection.Pull;
  const [localManifest, remoteManifest] = await Promise.all([
    getManifest(localDirectory, folders),
    readRemoteManifest(peer, remoteDirectory, folders),
  ]);
  const directories = isPull
    ? getChangedDirectories(remoteManifest, localManifest)
    : getChangedDirectories(localManifest, remoteManifest);
  // Each changed directory's files on both sides, all listed before a stamp is read or a file is chosen
  const changed: ChangedDirectory[] = [];
  if (directories.length > 0)
    for await (const listing of readRemoteListings(peer, remoteDirectory, directories)) {
      const localFiles = (await readDirectory(join(localDirectory, listing.directory))).files;
      changed.push(
        isPull
          ? { directory: listing.directory, source: listing.files, target: localFiles }
          : { directory: listing.directory, source: localFiles, target: listing.files },
      );
    }

  // The source's stamps are read before any file is chosen, so a stamped folder's files and a stamped file never reach the
  // Copy. A machine with no install has no game version to hold them to, so it reads no stamps and takes them all
  const candidates = checkHasGameInstall() ? getStampCandidates(changed) : [];
  let stamps: StampEntry[] = [];
  if (candidates.length > 0)
    stamps = isPull
      ? await readRemoteStamps(peer, remoteDirectory, candidates)
      : await readLocalStamps(localDirectory, candidates);
  // The game version is read only when there are candidates to hold to it, so a copy with none never needs config.ini
  const gameVersion = candidates.length > 0 ? await readGameVersion() : undefined;
  const sizes = new Map<string, number>();
  for (const { directory, source, target } of changed)
    for (const file of selectChangedFiles(source, target)) sizes.set(posix.join(directory, file.name), file.size);
  const { refused, vouched } = selectVouchedPaths([...sizes.keys()], stamps, gameVersion);
  const bytes = vouched.reduce((total, path) => total + (sizes.get(path) ?? 0), 0);

  const label = `${direction.toLowerCase()} ${peer.host}`;
  if (refused.length > 0 && gameVersion !== undefined)
    console.info(
      `${label}: refused ${refused.length} files stamped with another game version than this install's ${gameVersion}`,
    );
  if (isDryRun) {
    console.info(`${label} (dry run): ${vouched.length} files, ${bytes} bytes would move`);
    return;
  }
  if (vouched.length === 0) {
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
  source.stdin.end(`${vouched.join("\n")}\n`);
  await pipeline(source.stdout, target.stdin);
  const [sourceCode, targetCode] = await Promise.all([sourceExitCode, targetExitCode]);
  if (sourceCode !== SUCCESS_EXIT_CODE || targetCode !== SUCCESS_EXIT_CODE)
    throw new InvalidOperationError(Operation.Update, peer.host, `the transfer exited ${sourceCode} and ${targetCode}`);
  console.info(`${label}: ${formatTransferSummary(vouched.length, bytes, performance.now() - startedAt)}`);
};
