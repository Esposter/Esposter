import type { DirectoryListing } from "#src/models/fleet/data/DirectoryListing";
import type { Manifest } from "#src/models/fleet/data/Manifest";
import type { Peer } from "#src/models/fleet/data/Peer";
import type { Provenance } from "#src/models/provenance/Provenance";
import type { MockInstance } from "vitest";

import { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import { readRemoteListings } from "#src/services/fleet/data/readRemoteListings";
import { readRemoteManifest } from "#src/services/fleet/data/readRemoteManifest";
import { readRemoteStamps } from "#src/services/fleet/data/readRemoteStamps";
import { syncPeer } from "#src/services/fleet/data/syncPeer";
import { checkHasGameInstall } from "#src/services/genshinAssets/shared/checkHasGameInstall";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/shared/checkHasGameInstall"), () => ({
  checkHasGameInstall: vi.fn<() => boolean>(),
}));
vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: vi.fn<() => Promise<string>>(),
}));
vi.mock(import("#src/services/fleet/data/readRemoteManifest"), () => ({
  readRemoteManifest: vi.fn<() => Promise<Manifest>>(),
}));
vi.mock(import("#src/services/fleet/data/readRemoteListings"), () => ({
  readRemoteListings: vi.fn<typeof readRemoteListings>(),
}));
vi.mock(import("#src/services/fleet/data/readRemoteStamps"), () => ({
  readRemoteStamps: vi.fn<typeof readRemoteStamps>(),
}));

// A stamp as a machine's own command wrote it, naming the game version it was read from
const createProvenance = (gameVersion: string): Provenance => ({
  command: "fixture",
  gameVersion,
  operatingSystem: { platform: "fixture", release: "fixture", version: "fixture" },
  producer: { commit: "fixture", isDirty: false, producerPaths: [] },
  sources: [],
  tools: [],
});

// The listings a peer streams one directory at a time, as the real listing does
const streamListings = async function* (listings: DirectoryListing[]): AsyncGenerator<DirectoryListing> {
  for (const listing of await Promise.resolve(listings)) yield listing;
};

describe(syncPeer, () => {
  const INSTALL_VERSION = "a";
  const OTHER_VERSION = "b";
  const FOLDER = "extracted/login/interface";
  const MUSIC = "extracted/login/music";
  const PEER: Peer = {
    host: "192.0.2.1",
    identityFile: "",
    parityDirectory: "/remote/parity",
    repository: "/remote/repository",
    user: "fleet",
  };

  let localDirectory: string;
  let info: MockInstance<typeof console.info>;

  // The lines the copy printed, which is how a dry run shows what it would move
  const printed = (): string[] => info.mock.calls.map(([line]) => String(line));

  beforeEach(() => {
    localDirectory = mkdtempSync(join(tmpdir(), "sync-peer-"));
    info = vi.spyOn(console, "info").mockReturnValue(undefined);
    vi.mocked(readGameVersion).mockResolvedValue(INSTALL_VERSION);
    vi.mocked(checkHasGameInstall).mockReturnValue(true);
  });

  afterEach(() => {
    info.mockRestore();
    rmSync(localDirectory, { force: true, recursive: true });
  });

  test("the fleet copy refuses a folder stamped with another game version", async () => {
    expect.hasAssertions();

    vi.mocked(readRemoteManifest).mockResolvedValue({ [FOLDER]: "remote" });
    vi.mocked(readRemoteListings).mockReturnValue(
      streamListings([
        {
          directory: FOLDER,
          files: [
            { mtime: 1, name: "interface.json", size: 10 },
            { mtime: 1, name: PROVENANCE_NAME, size: 20 },
          ],
        },
      ]),
    );
    vi.mocked(readRemoteStamps).mockResolvedValue([
      { path: `${FOLDER}/${PROVENANCE_NAME}`, provenance: createProvenance(OTHER_VERSION) },
    ]);

    await syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(printed()).toStrictEqual([
      "pull 192.0.2.1: refused 2 files stamped with another game version than this install's a",
      "pull 192.0.2.1 (dry run): 0 files, 0 bytes would move",
    ]);
  });

  test("the fleet copy refuses a file stamped with another game version", async () => {
    expect.hasAssertions();

    vi.mocked(readRemoteManifest).mockResolvedValue({ [MUSIC]: "remote" });
    vi.mocked(readRemoteListings).mockReturnValue(
      streamListings([
        {
          directory: MUSIC,
          files: [
            { mtime: 1, name: "playlist.json", size: 10 },
            { mtime: 1, name: `playlist.json${PROVENANCE_SIDECAR_SUFFIX}`, size: 5 },
            { mtime: 1, name: "recording.wav", size: 100 },
          ],
        },
      ]),
    );
    vi.mocked(readRemoteStamps).mockResolvedValue([
      { path: `${MUSIC}/playlist.json${PROVENANCE_SIDECAR_SUFFIX}`, provenance: createProvenance(OTHER_VERSION) },
    ]);

    await syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(printed()).toStrictEqual([
      "pull 192.0.2.1: refused 2 files stamped with another game version than this install's a",
      "pull 192.0.2.1 (dry run): 1 files, 100 bytes would move",
    ]);
  });

  test("a machine with no install copies a stamped folder", async () => {
    expect.hasAssertions();

    vi.mocked(checkHasGameInstall).mockReturnValue(false);
    vi.mocked(readRemoteManifest).mockResolvedValue({ [FOLDER]: "remote" });
    vi.mocked(readRemoteListings).mockReturnValue(
      streamListings([
        {
          directory: FOLDER,
          files: [
            { mtime: 1, name: "interface.json", size: 10 },
            { mtime: 1, name: PROVENANCE_NAME, size: 20 },
          ],
        },
      ]),
    );
    vi.mocked(readRemoteStamps).mockResolvedValue([
      { path: `${FOLDER}/${PROVENANCE_NAME}`, provenance: createProvenance(OTHER_VERSION) },
    ]);

    await syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(printed()).toStrictEqual(["pull 192.0.2.1 (dry run): 2 files, 30 bytes would move"]);
  });

  test("a machine with no install does not read the peer's stamps", async () => {
    expect.hasAssertions();

    vi.mocked(checkHasGameInstall).mockReturnValue(false);
    vi.mocked(readRemoteManifest).mockResolvedValue({ [FOLDER]: "remote" });
    vi.mocked(readRemoteListings).mockReturnValue(
      streamListings([{ directory: FOLDER, files: [{ mtime: 1, name: "interface.json", size: 10 }] }]),
    );

    await syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(vi.mocked(readRemoteStamps)).not.toHaveBeenCalled();
    expect(printed()).toStrictEqual(["pull 192.0.2.1 (dry run): 1 files, 10 bytes would move"]);
  });

  test("a pull with changes but no stamp completes without reading the game version", async () => {
    expect.hasAssertions();

    vi.mocked(readGameVersion).mockRejectedValue(new Error(" "));
    vi.mocked(readRemoteManifest).mockResolvedValue({ [FOLDER]: "remote" });
    vi.mocked(readRemoteListings).mockReturnValue(
      streamListings([{ directory: FOLDER, files: [{ mtime: 1, name: "interface.json", size: 10 }] }]),
    );
    vi.mocked(readRemoteStamps).mockResolvedValue([]);

    await syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(printed()).toStrictEqual(["pull 192.0.2.1 (dry run): 1 files, 10 bytes would move"]);
  });

  test("a pull with no directory to compare completes without reading the game version", async () => {
    expect.hasAssertions();

    vi.mocked(readGameVersion).mockRejectedValue(new Error(" "));
    vi.mocked(readRemoteManifest).mockResolvedValue({});
    vi.mocked(readRemoteListings).mockReturnValue(streamListings([]));

    await expect(
      syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, { isDryRun: false }),
    ).resolves.toBeUndefined();
    expect(printed()).toStrictEqual(["pull 192.0.2.1: nothing to copy"]);
  });

  test("the fleet copy refuses a subtree whose folder above it is stamped with another game version", async () => {
    expect.hasAssertions();

    const subtree = `${FOLDER}/sub`;
    vi.mocked(readRemoteManifest).mockResolvedValue({ [subtree]: "remote" });
    vi.mocked(readRemoteListings).mockReturnValue(
      streamListings([{ directory: subtree, files: [{ mtime: 1, name: "frame.png", size: 10 }] }]),
    );
    vi.mocked(readRemoteStamps).mockResolvedValue([
      { path: `${FOLDER}/${PROVENANCE_NAME}`, provenance: createProvenance(OTHER_VERSION) },
    ]);

    await syncPeer(TransferDirection.Pull, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(vi.mocked(readRemoteStamps)).toHaveBeenCalledWith(
      PEER,
      PEER.parityDirectory,
      expect.arrayContaining([`${FOLDER}/${PROVENANCE_NAME}`]),
    );
    expect(printed()).toStrictEqual([
      "pull 192.0.2.1: refused 1 files stamped with another game version than this install's a",
      "pull 192.0.2.1 (dry run): 0 files, 0 bytes would move",
    ]);
  });

  test("the fleet copy refuses a folder stamped with another game version when it pushes", async () => {
    expect.hasAssertions();

    const folder = join(localDirectory, FOLDER);
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, "interface.json"), "x".repeat(10));
    writeJsonFile(join(folder, PROVENANCE_NAME), createProvenance(OTHER_VERSION));
    vi.mocked(readRemoteManifest).mockResolvedValue({});
    vi.mocked(readRemoteListings).mockReturnValue(streamListings([{ directory: FOLDER, files: [] }]));

    await syncPeer(TransferDirection.Push, PEER, ["extracted"], localDirectory, PEER.parityDirectory, {
      isDryRun: true,
    });

    expect(printed()).toStrictEqual([
      "push 192.0.2.1: refused 2 files stamped with another game version than this install's a",
      "push 192.0.2.1 (dry run): 0 files, 0 bytes would move",
    ]);
  });
});
