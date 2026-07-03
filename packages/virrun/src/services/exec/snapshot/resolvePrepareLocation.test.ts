import type { PrepareStep } from "@/models/virrun/PrepareStep";

import { NUXT_OUTPUT_DIRECTORY, NUXT_PREPARE_COMMAND } from "@/services/configuration/constants";
import {
  VIRRUN_PREPARE_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { resolvePrepareLocation } from "@/services/exec/snapshot/resolvePrepareLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const step: PrepareStep = { command: NUXT_PREPARE_COMMAND, outputs: [NUXT_OUTPUT_DIRECTORY] };

describe(resolvePrepareLocation, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  let cacheHome = "";

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("addresses the layer under prepare/<key> with its upper dir, outside the repo", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    const { dir, upperDir } = resolvePrepareLocation(workspace, step);

    expect(dir.startsWith(join(cacheHome, VIRRUN_PREPARE_DIRECTORY_NAME))).toBe(true);
    expect(upperDir).toBe(join(dir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME));
    expect(dir.startsWith(workspace)).toBe(false);
  });

  test("reports exists only once the upper layer has been captured on disk", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();

    expect(resolvePrepareLocation(workspace, step).exists).toBe(false);

    mkdirSync(resolvePrepareLocation(workspace, step).upperDir, { recursive: true });

    expect(resolvePrepareLocation(workspace, step).exists).toBe(true);
  });

  test("re-keys when the source tree changes so a source edit provisions a fresh layer", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    execFileSync("git", ["init", "-q"], { cwd: workspace });
    const file = join(workspace, TEST_FILENAME);
    writeFileSync(file, "");
    const before = resolvePrepareLocation(workspace, step).key;
    writeFileSync(file, " ");

    expect(resolvePrepareLocation(workspace, step).key).not.toBe(before);
  });

  test("keys differently for a different prepare step", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    const other: PrepareStep = { command: NUXT_PREPARE_COMMAND, outputs: [TEST_FILENAME] };

    expect(resolvePrepareLocation(workspace, step).key).not.toBe(resolvePrepareLocation(workspace, other).key);
  });
});
