import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";

import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getHeadlessPackageFailures } from "#src/services/workspace/getHeadlessPackageFailures";
import { describe, expect, test } from "vitest";

describe(getHeadlessPackageFailures, () => {
  const PACKAGE_NAME = "vue-grid-layout-headless";
  const WRONG_PACKAGE_NAME = "headless-grid-layout";
  const FRAMEWORK_FREE_PACKAGE_NAME = "grid-engine-headless";
  const CONVENTION_MANIFEST: PackageShapeManifest = {
    exports: { ".": "", "./package.json": "" },
    name: PACKAGE_NAME,
    peerDependencies: { vue: "catalog:" },
  };
  const FRAMEWORK_FREE_MANIFEST: PackageShapeManifest = {
    exports: { ".": "", "./package.json": "" },
    name: FRAMEWORK_FREE_PACKAGE_NAME,
  };
  // A source file that uses Vue, so a test about another rule is not also about this one
  const VUE_SOURCE_FILES = [{ path: TEST_FILENAME, text: 'import { ref } from "vue";' }];
  // A source file that imports no framework, so a test about another rule is not also about this one
  const NEUTRAL_SOURCE_FILES = [{ path: TEST_FILENAME, text: 'import { ok } from "neverthrow";' }];

  test("a package that follows the convention passes the check", () => {
    expect.hasAssertions();

    expect(getHeadlessPackageFailures(CONVENTION_MANIFEST, VUE_SOURCE_FILES)).toStrictEqual([]);
  });

  test("a headless package without a Vue peer fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures({ ...CONVENTION_MANIFEST, peerDependencies: {} }, VUE_SOURCE_FILES),
    ).toStrictEqual([`${PACKAGE_NAME} is headless, so it must declare vue as a peer dependency`]);
  });

  test("a headless package with the wrong name fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures({ ...FRAMEWORK_FREE_MANIFEST, name: WRONG_PACKAGE_NAME }, NEUTRAL_SOURCE_FILES),
    ).toStrictEqual([`${WRONG_PACKAGE_NAME} is headless without a vue- prefix, so it must be named <thing>-headless`]);
  });

  test("a headless package that never imports Vue fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(CONVENTION_MANIFEST, [
        { path: TEST_FILENAME, text: 'import { z } from "zod"; import { vueuse } from "vue-demi";' },
      ]),
    ).toStrictEqual([`${PACKAGE_NAME} never imports vue, so it ships no Vue abstraction for its name to claim`]);
  });

  test("a package with a subpath export fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(
        { ...CONVENTION_MANIFEST, exports: { ".": "", "./package.json": "", "./utils": "" } },
        VUE_SOURCE_FILES,
      ),
    ).toStrictEqual([
      `${PACKAGE_NAME} exports ./utils, but a headless package exports only its entry and its manifest`,
    ]);
  });

  test("a package that imports Pinia fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(CONVENTION_MANIFEST, [
        ...VUE_SOURCE_FILES,
        { path: `pinia/${TEST_FILENAME}`, text: 'import { defineStore } from "pinia";' },
        { path: `nested/${TEST_FILENAME}`, text: 'const { createTestingPinia } = await import("@pinia/testing");' },
      ]),
    ).toStrictEqual([
      `${PACKAGE_NAME} imports Pinia in pinia/${TEST_FILENAME}, but a headless package leaves stores to the app`,
      `${PACKAGE_NAME} imports Pinia in nested/${TEST_FILENAME}, but a headless package leaves stores to the app`,
    ]);
  });

  test("a framework-free headless package that imports no framework passes the check", () => {
    expect.hasAssertions();

    expect(getHeadlessPackageFailures(FRAMEWORK_FREE_MANIFEST, NEUTRAL_SOURCE_FILES)).toStrictEqual([]);
  });

  test("a framework-free headless package that declares a framework peer fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(
        { ...FRAMEWORK_FREE_MANIFEST, peerDependencies: { vue: "catalog:" } },
        NEUTRAL_SOURCE_FILES,
      ),
    ).toStrictEqual([
      `${FRAMEWORK_FREE_PACKAGE_NAME} is a framework-free headless package, so it declares no framework peer, but declares vue as a peer dependency`,
    ]);
  });

  test("a framework-free headless package that imports a framework or its subpath fails the check", () => {
    expect.hasAssertions();

    expect(
      getHeadlessPackageFailures(FRAMEWORK_FREE_MANIFEST, [
        { path: `phaser/${TEST_FILENAME}`, text: 'import Phaser from "phaser";' },
        {
          path: `nested/${TEST_FILENAME}`,
          text: 'import { OrbitControls } from "three/addons/controls/OrbitControls.js";',
        },
      ]),
    ).toStrictEqual([
      `${FRAMEWORK_FREE_PACKAGE_NAME} is a framework-free headless package, so it imports no framework, but phaser/${TEST_FILENAME} imports one`,
      `${FRAMEWORK_FREE_PACKAGE_NAME} is a framework-free headless package, so it imports no framework, but nested/${TEST_FILENAME} imports one`,
    ]);
  });
});
