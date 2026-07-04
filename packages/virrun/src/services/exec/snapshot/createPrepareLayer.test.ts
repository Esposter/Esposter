import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { PrepareStep } from "@/models/virrun/PrepareStep";

import { NUXT_PREPARE_COMMAND } from "@/services/configuration/constants";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { createPrepareLayer } from "@/services/exec/snapshot/createPrepareLayer";
import { resolvePrepareLocation } from "@/services/exec/snapshot/resolvePrepareLocation";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createRecordingBackend } from "@/services/exec/test/createRecordingBackend.test";
import { seedFile } from "@/services/exec/test/seedFile.test";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test } from "vitest";

// A two-segment output dir (`a/a`) the fake prepare command populates, alongside a node_modules tree it churns.
const OUTPUT = `${TEST_FILENAME}/${TEST_FILENAME}`;
const prepareStep: PrepareStep = { command: NUXT_PREPARE_COMMAND, outputs: [OUTPUT] };
// Stands in for the os backend running `nuxt prepare`: on success it writes the declared output plus incidental
// Dep-tree churn into the capture upper, so the test can assert only the output survives the publish.
const createFakeBackend = (exitCode: number): ReturnType<typeof createRecordingBackend> & ExecBackend =>
  createRecordingBackend({ exitCode, stderr: "", stdout: "" }, (options) => {
    const upperDir = options.overlayLayers?.upperDir;
    if (exitCode === 0 && upperDir !== undefined) {
      seedFile(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME));
      seedFile(join(upperDir, NODE_MODULES_DIRECTORY, TEST_FILENAME));
    }
  });

describe(createPrepareLayer, () => {
  const { createWorkspace } = setupTemporaryCacheHome();
  let repo = "";

  beforeEach(() => {
    repo = createWorkspace();
  });

  test("captures only the declared outputs, dropping dep-tree churn, and publishes the layer", async () => {
    expect.hasAssertions();

    mkdirSync(resolveSnapshotLocation(repo).upperDir, { recursive: true });
    const backend = createFakeBackend(0);
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
    const backend = createFakeBackend(0);
    await createPrepareLayer(backend, prepareStep, { cwd: repo, stdio: "pipe" }, resolvePrepareLocation(repo, prepareStep));

    const { dir } = resolvePrepareLocation(repo, prepareStep);
    const { lowerDirs, upperDir, workDir } = backend.calls[0]?.overlayLayers ?? {};

    expect(lowerDirs).toStrictEqual([depsUpperDir]);
    expect(upperDir?.startsWith(join(dir, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`))).toBe(true);
    expect(workDir?.startsWith(join(dir, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`))).toBe(true);
  });

  test("throws when there is no deps snapshot to fork", () => {
    expect.hasAssertions();

    const backend = createFakeBackend(0);

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
    const backend = createFakeBackend(1);

    await expect(createPrepareLayer(backend, prepareStep, { cwd: repo, stdio: "pipe" }, resolvePrepareLocation(repo, prepareStep))).rejects.toThrow(
      InvalidOperationError,
    );
    expect(resolvePrepareLocation(repo, prepareStep).exists).toBe(false);
  });
});
