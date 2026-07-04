import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { SOURCE_MIRROR_TIMEOUT_SECONDS } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { buildSourceMirrorManifest } from "@/services/exec/wsl/buildSourceMirrorManifest";
import {
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME,
  VIRRUN_SOURCES_DIRECTORY_NAME,
} from "@/services/exec/wsl/constants";
import { TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { createWslSourceMirrorSync } from "@/services/exec/wsl/createWslSourceMirrorSync";
import { getSourceMirrorKey } from "@/services/exec/wsl/getSourceMirrorKey";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({ cacheRoot: "" }));
// The "UNC" cache root is just a real temp dir here, so the planner's host-side staging/reads exercise real fs; the
// Same TEST_WSL_PREFIX transform the sibling wsl tests use derives the Linux-side paths embedded in the script.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({ getWslNativeCacheRoot: () => state.cacheRoot }));

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));
// The temp cwd resolves no config on disk, so resolveMirrorExcludes would walk up to the real repo's
// Virrun.config.json (environment nuxt) and fire `git ls-files` ahead of the plan. Pin it undefined so the
// Environment defaults to none and the mirror excludes stay the base node_modules/.git pair.
vi.mock(import("@/services/configuration/resolveVirrunConfiguration"), () => ({
  resolveVirrunConfiguration: () => undefined,
}));

describe(createWslSourceMirrorSync, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cwd = "";
  let entryUnc = "";
  const readStaged = (prefix: string): string => {
    const name = readdirSync(entryUnc).find((entry) => entry.startsWith(prefix));
    return name === undefined ? "" : readFileSync(join(entryUnc, name), "utf8");
  };
  // Simulate a prior successful sync: the tree dir exists and the published manifest matches the given tree state.
  const publish = (): void => {
    mkdirSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME), { recursive: true });
    writeFileSync(
      join(entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME),
      JSON.stringify(buildSourceMirrorManifest(cwd, [])),
    );
  };

  beforeEach(() => {
    cwd = create();
    state.cacheRoot = create();
    entryUnc = join(state.cacheRoot, VIRRUN_SOURCES_DIRECTORY_NAME, getSourceMirrorKey(cwd));
    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
  });

  afterEach(cleanup);

  test("first run falls back to a locked full rsync and stages the manifest for publish", () => {
    expect.hasAssertions();

    const { lockPath, mirrorPath, script } = createWslSourceMirrorSync(cwd);

    expect(mirrorPath).toBe(getWslSourceMirrorPath(cwd));
    expect(lockPath).toBe(`${mirrorPath}.lock`);
    expect(script).toContain(`mkdir -p '${mirrorPath}'`);
    expect(script).toContain(`flock -w ${SOURCE_MIRROR_TIMEOUT_SECONDS} 9`);
    expect(script).toContain(
      `timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} rsync -a --delete --exclude='node_modules' --exclude='.git' '${TEST_WSL_PREFIX}${cwd}/' '${mirrorPath}/'`,
    );
    expect(script).toContain(`9> '${mirrorPath}.lock'`);
    expect(script).toContain(`/${VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME}'`);
    // The next manifest and the origin marker are staged host-side as pid-tagged temps the script publishes via
    // Atomic mv — the origin content is the host cwd the abandonment reaper keys on.
    expect(JSON.parse(readStaged(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${process.pid}.`))).toHaveProperty(
      TEST_FILENAME,
    );
    expect(readStaged(`${VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX}${process.pid}.`)).toBe(cwd);
  });

  test("returns an empty script when the published manifest matches the working tree", () => {
    expect.hasAssertions();

    publish();

    const { lockPath, mirrorPath, script } = createWslSourceMirrorSync(cwd);

    expect(script).toBe("");
    // The skip path still returns the lock path — the run holds a shared flock on it while bwrap reads the mirror.
    expect(lockPath).toBe(`${mirrorPath}.lock`);
    // Nothing is staged on the skip path — the run pays no sync at all.
    expect(readStaged(VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX)).toBe("");
  });

  test("stages null-delimited copy and delete lists and applies only the delta", () => {
    expect.hasAssertions();

    publish();
    const removedFilename = "b";
    writeFileSync(
      join(entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME),
      JSON.stringify({
        ...buildSourceMirrorManifest(cwd, []),
        [removedFilename]: { mtimeMs: 0, size: 0, target: "", type: SourceMirrorEntryType.File },
      }),
    );
    writeFileSync(join(cwd, TEST_FILENAME), `${TEST_FILENAME}${TEST_FILENAME}`);

    const { mirrorPath, script } = createWslSourceMirrorSync(cwd);

    expect(script).toContain(`xargs -0r rm -rf --`);
    expect(script).toContain(`rsync -a --from0 --files-from=`);
    expect(script).not.toContain("--delete ");
    expect(script).toContain(`'${TEST_WSL_PREFIX}${cwd}/' '${mirrorPath}/'`);
    expect(readStaged(VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX)).toBe(`${TEST_FILENAME}\0`);
    expect(readStaged(VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX)).toBe(`${removedFilename}\0`);
  });

  test("falls back to the full rsync when the manifest is unreadable", () => {
    expect.hasAssertions();

    publish();
    writeFileSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME), "{");

    expect(createWslSourceMirrorSync(cwd).script).toContain("rsync -a --delete");
  });

  test("distrusts a manifest whose mirror tree is gone and forces the full rsync", () => {
    expect.hasAssertions();

    publish();
    rmSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME), { force: true, recursive: true });

    expect(createWslSourceMirrorSync(cwd).script).toContain("rsync -a --delete");
  });
});
