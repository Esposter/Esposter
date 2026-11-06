import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";

import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getHeadlessPackageFailures } from "#src/services/workspace/getHeadlessPackageFailures";
import { describe, expect, test } from "vitest";

describe(getHeadlessPackageFailures, () => {
  const PACKAGE_NAME = "vue-grid-layout-headless";
  const WRONG_PACKAGE_NAME = "headless-grid-layout";
  const CONVENTION_MANIFEST: PackageShapeManifest = {
    exports: { ".": "", "./package.json": "" },
    name: PACKAGE_NAME,
    peerDependencies: { vue: "catalog:" },
  };

  test("a package that follows the convention passes the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(CONVENTION_MANIFEST, [{ path: TEST_FILENAME, text: 'import { ref } from "vue";' }]),
    ).toStrictEqual([]);
  });

  test("a headless package without a Vue peer fails the check", () => {
    expect.hasAssertions();

    expect(getHeadlessPackageFailures({ ...CONVENTION_MANIFEST, peerDependencies: {} }, [])).toStrictEqual([
      `${PACKAGE_NAME} is headless, so it must declare vue as a peer dependency`,
    ]);
  });

  test("a headless package with the wrong name fails the check", () => {
    expect.hasAssertions();

    expect(getHeadlessPackageFailures({ ...CONVENTION_MANIFEST, name: WRONG_PACKAGE_NAME }, [])).toStrictEqual([
      `${WRONG_PACKAGE_NAME} is headless, so it must be named vue-<thing>-headless`,
    ]);
  });

  test("a package with a subpath export fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(
        { ...CONVENTION_MANIFEST, exports: { ".": "", "./package.json": "", "./utils": "" } },
        [],
      ),
    ).toStrictEqual([
      `${PACKAGE_NAME} exports ./utils, but a headless package exports only its entry and its manifest`,
    ]);
  });

  test("a package that imports Pinia fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(CONVENTION_MANIFEST, [
        { path: TEST_FILENAME, text: 'import { defineStore } from "pinia";' },
        { path: `nested/${TEST_FILENAME}`, text: 'const { createTestingPinia } = await import("@pinia/testing");' },
      ]),
    ).toStrictEqual([
      `${PACKAGE_NAME} imports Pinia in ${TEST_FILENAME}, but a headless package leaves stores to the app`,
      `${PACKAGE_NAME} imports Pinia in nested/${TEST_FILENAME}, but a headless package leaves stores to the app`,
    ]);
  });
});
