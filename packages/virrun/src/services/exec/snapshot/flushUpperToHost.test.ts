import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { flushUpperToHost } from "@/services/exec/snapshot/flushUpperToHost";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// Read a tree into a flat { relativePath: content } map — directories as the marker, files as their text — so two
// Trees can be compared structurally. mtime/mode are deliberately ignored (mtime always differs; mode is unreliable
// Over the win32 \\wsl.localhost bridge), and the end-to-end WSL verification already asserts mode parity.
const DIRECTORY_MARKER = "<dir>";
const readTree = (root: string): Record<string, string> => {
  const tree: Record<string, string> = {};
  const walk = (directory: string, prefix: string): void => {
    for (const name of readdirSync(directory)) {
      const absolute = join(directory, name);
      const relative = prefix === "" ? name : `${prefix}/${name}`;
      if (statSync(absolute).isDirectory()) {
        tree[`${relative}/`] = DIRECTORY_MARKER;
        walk(absolute, relative);
      } else tree[relative] = readFileSync(absolute, "utf8");
    }
  };
  walk(root, "");
  return tree;
};

// The overlay upper must live on a real fs with xattr/whiteout support — never /mnt/c (v9fs) on win32 — so the test
// Roots go on the WSL distro's ext4 home there, mirroring the snapshot cache. On Linux $HOME/.cache is already ext4.
const createOverlayRoot = (): string => {
  const cacheBase = process.platform === "win32" ? getWslNativeCacheRoot() : join(homedir(), HOME_CACHE_DIRECTORY_NAME);
  mkdirSync(cacheBase, { recursive: true });
  return mkdtempSync(join(cacheBase, VIRRUN_TEMP_DIR_PREFIX));
};

// A mutation that exercises every flush case at once: a created file, an in-place modification, a deletion
// (whiteout), a removed-and-recreated directory (opaque), and a new nested tree.
const MUTATE_COMMAND =
  "printf created > created.txt; printf X >> existing.txt; rm tracked.txt; rm -rf opaquedir; mkdir opaquedir; printf new > opaquedir/new.txt; mkdir -p nested/deep; printf d > nested/deep/f.txt";

describe.skipIf(!isOsBackendSupported())(flushUpperToHost, () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots) removeSnapshotDirectory(root);
    roots.length = 0;
  });

  test("flushes a sandbox run's writes so the host tree matches a native run", async () => {
    expect.hasAssertions();

    const root = createOverlayRoot();
    roots.push(root);
    const source = join(root, "source");
    const upperDir = join(root, "upper");
    const workDir = join(root, "work");
    mkdirSync(join(source, "keep"), { recursive: true });
    mkdirSync(join(source, "opaquedir"), { recursive: true });
    mkdirSync(upperDir);
    mkdirSync(workDir);
    writeFileSync(join(source, "tracked.txt"), "orig");
    writeFileSync(join(source, "existing.txt"), "orig");
    writeFileSync(join(source, "keep", "k.txt"), "k");
    writeFileSync(join(source, "opaquedir", "old.txt"), "old");

    const result = await createOsBackend().exec(MUTATE_COMMAND, {
      cwd: source,
      overlayLayers: { upperDir, workDir },
      stdio: "pipe",
    });
    expect(result.exitCode).toBe(0);

    flushUpperToHost(upperDir, source, "");

    expect(readTree(source)).toStrictEqual({
      "created.txt": "created",
      "existing.txt": "origX",
      "keep/": DIRECTORY_MARKER,
      "keep/k.txt": "k",
      "nested/": DIRECTORY_MARKER,
      "nested/deep/": DIRECTORY_MARKER,
      "nested/deep/f.txt": "d",
      "opaquedir/": DIRECTORY_MARKER,
      "opaquedir/new.txt": "new",
    });
  });
});
