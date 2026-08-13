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
import {beforeEach, describe, expect, test, vi} from "vitest";

// A two-segment output dir (`a/a`) the fake prepare command populates, alongside a node_modules tree it churns.
const OUTPUT = `${TEST_FILENAME}/${TEST_FILENAME}`;
const prepareStep: PrepareStep = { command: NUXT_PREPARE_COMMAND, outputs: [OUTPUT] };
// Stands in for the os backend running `nuxt prepare`: on success it writes the declared output plus incidental
// Dep-tree churn into the capture upper, so the test can assert only the output survives the publish.
const createFakeBackend = (exitCode: number): ExecBackend & ReturnType<typeof createRecordingBackend> =>
  createRecordingBackend({ exitCode, stderr: "", stdout: "" }, (options) => {
    const upperDir = options.overlayLayers?.upperDir;
    if (exitCode === 0 && upperDir !== undefined) {
      seedFile(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME));
      seedFile(join(upperDir, NODE_MODULES_DIRECTORY, TEST_FILENAME));
    }
  });

vi.mock(
  import("@/services/exec/util/getSandboxNodeVersion"),
  () => import("@/services/exec/test/getSandboxNodeVersion.test"),
);

describe(createPrepareLayer, () => {
  const { createWorkspace } = setupTemporaryCacheHome();
  let repository = "";
  // The layer is always provisioned for this suite's own repository and step, so only the backend varies
  const prepare = (backend: ExecBackend) =>
    createPrepareLayer(backend, prepareStep, { cwd: repository, stdio: "pipe" }, resolvePrepareLocation(repository, prepareStep));

  beforeEach(() => {
    repository = createWorkspace();
  });

  test("captures only the declared outputs, dropping dep-tree churn, and publishes the layer", async () => {
    expect.hasAssertions();

    mkdirSync(resolveSnapshotLocation(repository).upperDir, { recursive: true });
    const backend = createFakeBackend(0);
    await prepare(backend);

    const { exists, upperDir } = resolvePrepareLocation(repository, prepareStep);

    expect(exists).toBe(true);
    expect(existsSync(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME))).toBe(true);
    expect(existsSync(join(upperDir, NODE_MODULES_DIRECTORY))).toBe(false);
  });

  test("forks the deps snapshot as the lower with a per-invocation capture upper", async () => {
    expect.hasAssertions();

    const dependenciesUpperDir = resolveSnapshotLocation(repository).upperDir;
    mkdirSync(dependenciesUpperDir, { recursive: true });
    const backend = createFakeBackend(0);
    await prepare(backend);

    const { dir: directory } = resolvePrepareLocation(repository, prepareStep);
    const { lowerDirs, upperDir, workDir } = backend.calls[0]?.overlayLayers ?? {};

    expect(lowerDirs).toStrictEqual([dependenciesUpperDir]);
    expect(upperDir?.startsWith(join(directory, `${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.`))).toBe(true);
    expect(workDir?.startsWith(join(directory, `${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.`))).toBe(true);
  });

  test("throws when there is no deps snapshot to fork", () => {
    expect.hasAssertions();

    const backend = createFakeBackend(0);

    expect(() => prepare(backend)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${
        new InvalidOperationError(
          Operation.Create,
          createPrepareLayer.name,
          "no captured deps snapshot to fork for the prepare layer; run createSnapshot first",
        ).message
      }]`,
    );
  });

  test("throws when the prepare command fails so a half-built layer is never published", async () => {
    expect.hasAssertions();

    mkdirSync(resolveSnapshotLocation(repository).upperDir, { recursive: true });
    const backend = createFakeBackend(1);

    await expect(prepare(backend)).rejects.toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: Invalid operation: Create, name: createPrepareLayer, prepare command exited with 1: ]`);
    expect(resolvePrepareLocation(repository, prepareStep).exists).toBe(false);
  });
});
