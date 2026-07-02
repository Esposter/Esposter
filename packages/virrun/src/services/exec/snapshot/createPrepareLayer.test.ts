import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { PrepareStep } from "@/models/virrun/PrepareStep";

import { BackendType } from "@/models/virrun/BackendType";
import { NUXT_PREPARE_COMMAND } from "@/services/configuration/constants";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { createPrepareLayer } from "@/services/exec/snapshot/createPrepareLayer";
import { resolvePrepareLocation } from "@/services/exec/snapshot/resolvePrepareLocation";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { NODE_MODULES_DIRECTORY, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// A two-segment output dir (`a/a`) the fake prepare command populates, alongside a node_modules tree it churns.
const OUTPUT = `${TEST_FILENAME}/${TEST_FILENAME}`;
const prepareStep: PrepareStep = { command: NUXT_PREPARE_COMMAND, outputs: [OUTPUT] };
// Stands in for the os backend running `nuxt prepare`: on success it writes the declared output plus incidental
// Dep-tree churn into the capture upper, so the test can assert only the output survives the publish.
const createFakeBackend = (exitCode: number): { calls: ExecOptions[]; exec: ExecBackend["exec"] } => {
  const calls: ExecOptions[] = [];
  return {
    calls,
    exec: (_command, options): Promise<ExecResult> => {
      calls.push(options);
      const upperDir = options.overlayLayers?.upperDir;
      if (exitCode === 0 && upperDir !== undefined) {
        mkdirSync(join(upperDir, TEST_FILENAME, TEST_FILENAME), { recursive: true });
        writeFileSync(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME), "");
        mkdirSync(join(upperDir, NODE_MODULES_DIRECTORY), { recursive: true });
        writeFileSync(join(upperDir, NODE_MODULES_DIRECTORY, TEST_FILENAME), "");
      }
      return Promise.resolve({ exitCode, stderr: "", stdout: "" });
    },
  };
};

describe(createPrepareLayer, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  let repo = "";

  beforeEach(() => {
    process.env[VIRRUN_CACHE_HOME_KEY] = create();
    repo = createWorkspace();
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("captures only the declared outputs, dropping dep-tree churn, and publishes the layer", async () => {
    expect.hasAssertions();

    mkdirSync(resolveSnapshotLocation(repo).upperDir, { recursive: true });
    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    await createPrepareLayer(backend, prepareStep, { cwd: repo, stdio: "pipe" }, resolvePrepareLocation(repo, prepareStep));

    const { exists, upperDir } = resolvePrepareLocation(repo, prepareStep);

    expect(exists).toBe(true);
    expect(existsSync(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME))).toBe(true);
    expect(existsSync(join(upperDir, NODE_MODULES_DIRECTORY))).toBe(false);
  });

  test("forks the deps snapshot as the lower with a per-invocation capture upper", async () => {
    expect.hasAssertions();

    const depsUpperDir = resolveSnapshotLocation(repo).upperDir;
    mkdirSync(depsUpperDir, { recursive: true });
    const backend = { ...createFakeBackend(0), name: BackendType.Os };
    await createPrepareLayer(backend, prepareStep, { cwd: repo, stdio: "pipe" }, resolvePrepareLocation(repo, prepareStep));

    const { dir } = resolvePrepareLocation(repo, prepareStep);
    const { lowerDirs, upperDir, workDir } = backend.calls[0]?.overlayLayers ?? {};

    expect(lowerDirs).toStrictEqual([depsUpperDir]);
    expect(upperDir?.startsWith(join(dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`))).toBe(true);
    expect(workDir?.startsWith(join(dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`))).toBe(true);
  });

  test("throws when there is no deps snapshot to fork", () => {
    expect.hasAssertions();

    const backend = { ...createFakeBackend(0), name: BackendType.Os };

    expect(() => createPrepareLayer(backend, prepareStep, { cwd: repo, stdio: "pipe" }, resolvePrepareLocation(repo, prepareStep))).toThrow(
      new InvalidOperationError(
        Operation.Create,
        createPrepareLayer.name,
        "no captured deps snapshot to fork for the prepare layer; run createSnapshot first",
      ),
    );
  });

  test("throws when the prepare command fails so a half-built layer is never published", async () => {
    expect.hasAssertions();

    mkdirSync(resolveSnapshotLocation(repo).upperDir, { recursive: true });
    const backend = { ...createFakeBackend(1), name: BackendType.Os };

    await expect(createPrepareLayer(backend, prepareStep, { cwd: repo, stdio: "pipe" }, resolvePrepareLocation(repo, prepareStep))).rejects.toThrow(
      InvalidOperationError,
    );
    expect(resolvePrepareLocation(repo, prepareStep).exists).toBe(false);
  });
});
