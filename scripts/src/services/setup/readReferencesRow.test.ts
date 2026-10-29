import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";
import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { SetupStatus } from "#src/models/setup/SetupStatus";
import { getCachedReferencePath } from "#src/services/genshinParity/reference/getCachedReferencePath";
import { getRecordDestination } from "#src/services/genshinParity/reference/getRecordDestination";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { REFERENCES_RESTORE_ARGS, REFERENCES_RESTORE_COMMAND } from "#src/services/setup/constants";
import { createSetupEnvironment } from "#src/services/setup/createSetupEnvironment.test";
import { readReferencesRow } from "#src/services/setup/readReferencesRow";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { describe, expect, test, vi } from "vitest";

describe(readReferencesRow, () => {
  const RECORD_PATH = "city-areas.json";
  const REFERENCE_HASH = "a".repeat(64);
  const STEP = "parity references";
  const NO_INSTALL = { install: false, verify: false };
  const INSTALL = { install: true, verify: false };
  const manifest: ParityReferenceManifest = {
    recordings: [],
    records: [{ bytes: 1, path: RECORD_PATH, sha256: "b".repeat(64), sourceFormat: "json" }],
    references: [
      {
        attribution: {},
        bytes: 1,
        capturedAt: new Date(0).toISOString(),
        height: 1,
        id: "a",
        kind: ParityReferenceKind.Other,
        sha256: REFERENCE_HASH,
        sourceFormat: "png",
        width: 1,
      },
    ],
  };
  const createEnvironment = (overrides: Partial<SetupEnvironment> = {}): SetupEnvironment =>
    createSetupEnvironment({
      exists: () => true,
      readText: (path) => (path === REFERENCE_MANIFEST_PATH ? JSON.stringify(manifest) : undefined),
      ...overrides,
    });

  test("is in place when every record and stored image is on disk, and an install leaves it alone", () => {
    expect.hasAssertions();

    const environment = createEnvironment();

    expect(readReferencesRow(INSTALL, environment)).toStrictEqual({ next: "", status: SetupStatus.Ok, step: STEP });
    expect(environment.runVisibly).not.toHaveBeenCalled();
  });

  test.each([
    ["a stored image", getCachedReferencePath(REFERENCE_HASH)],
    ["a record", getRecordDestination(RECORD_PATH)],
  ])("names the restore command when %s is missing", (_description, missingPath) => {
    expect.hasAssertions();

    const environment = createEnvironment({ exists: (path) => path !== missingPath });

    expect(readReferencesRow(NO_INSTALL, environment)).toStrictEqual({
      next: REFERENCES_RESTORE_COMMAND,
      status: SetupStatus.NeedsYou,
      step: STEP,
    });
    expect(environment.runVisibly).not.toHaveBeenCalled();
  });

  test("runs the restore under --install when one is missing, and is done when it exits 0", () => {
    expect.hasAssertions();

    const environment = createEnvironment({ exists: (path) => path !== getRecordDestination(RECORD_PATH) });

    expect(readReferencesRow(INSTALL, environment)).toStrictEqual({ next: "", status: SetupStatus.Done, step: STEP });
    expect(environment.runVisibly).toHaveBeenCalledExactlyOnceWith(PNPM_FILE, [
      ...PNPM_ARGS,
      ...REFERENCES_RESTORE_ARGS,
    ]);
  });

  test("names the restore command again when it fails under --install", () => {
    expect.hasAssertions();

    const environment = createEnvironment({
      exists: (path) => path !== getRecordDestination(RECORD_PATH),
      runVisibly: vi.fn(() => ({ status: 1, stdout: null })),
    });

    expect(readReferencesRow(INSTALL, environment)).toStrictEqual({
      next: `${REFERENCES_RESTORE_COMMAND} failed: run it to read its error`,
      status: SetupStatus.NeedsYou,
      step: STEP,
    });
  });
});
