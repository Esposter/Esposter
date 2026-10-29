import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { FixtureReferenceStatus } from "#src/models/genshinParity/fixtures/FixtureReferenceStatus";
import { COMPONENTS_DIRECTORY } from "#src/services/genshinParity/fixtures/constants";
import { planReferenceFiles } from "#src/services/genshinParity/reference/planReferenceFiles";
import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getFixtureReferenceFilePath } from "#src/services/genshinParity/shared/getFixtureReferenceFilePath";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(planReferenceFiles, () => {
  const SCREEN_NAME = "FooScreen";
  const SCREEN_DIRECTORY = "Foo/Screen";
  const VARIANT = "artifacts";
  const REGION = { height: 0, width: 0, x: 0, y: 0 };
  const PROPS = {};
  const createFixtureRow = (variant: string): FixtureScreenRow => ({
    bar: null,
    directory: SCREEN_DIRECTORY,
    imageExists: true,
    lastScore: null,
    name: SCREEN_NAME,
    referenceId: "",
    referenceStatus: FixtureReferenceStatus.None,
    variant,
  });

  test("should place a variant's first whole-screen reference beside its snapshot, and every other reference flat under its id", () => {
    expect.hasAssertions();

    const referenceMap = {
      "first-whole-reference": { screen: SCREEN_NAME, source: " " },
      "region-reference": { region: REGION, screen: SCREEN_NAME, source: " " },
      "second-whole-reference": { screen: SCREEN_NAME, source: " " },
    } satisfies Record<string, ParityReference>;
    const plan = planReferenceFiles(referenceMap, [createFixtureRow("")], COMPONENTS_DIRECTORY);

    expect(plan.map(({ id, path }) => ({ id, path }))).toStrictEqual([
      {
        id: "first-whole-reference",
        path: getFixtureReferenceFilePath(join(COMPONENTS_DIRECTORY, "Foo", "Screen"), ""),
      },
      { id: "region-reference", path: join(REFERENCE_FILES_DIRECTORY, "region-reference.webp") },
      { id: "second-whole-reference", path: join(REFERENCE_FILES_DIRECTORY, "second-whole-reference.webp") },
    ]);
  });

  test("should place a variant's first reference beside its snapshot when it holds no whole-screen one", () => {
    expect.hasAssertions();

    const referenceMap = {
      "other-variant-region-reference": { region: REGION, screen: SCREEN_NAME, source: " ", variant: VARIANT },
      "variant-region-reference": { region: REGION, screen: SCREEN_NAME, source: " ", variant: VARIANT },
    } satisfies Record<string, ParityReference>;
    const plan = planReferenceFiles(referenceMap, [createFixtureRow(VARIANT)], COMPONENTS_DIRECTORY);

    expect(plan.map(({ id, path }) => ({ id, path }))).toStrictEqual([
      {
        id: "other-variant-region-reference",
        path: getFixtureReferenceFilePath(join(COMPONENTS_DIRECTORY, "Foo", "Screen"), VARIANT),
      },
      { id: "variant-region-reference", path: join(REFERENCE_FILES_DIRECTORY, "variant-region-reference.webp") },
    ]);
  });

  test("should leave a pending reference out, and keep a reference whose screen has no fixture flat", () => {
    expect.hasAssertions();

    const referenceMap = {
      "pending-reference": { pending: " ", screen: SCREEN_NAME },
      "unfixtured-reference": { screen: "BarScreen", source: " " },
    } satisfies Record<string, ParityReference>;
    const plan = planReferenceFiles(referenceMap, [createFixtureRow("")], COMPONENTS_DIRECTORY);

    expect(plan.map(({ id, path }) => ({ id, path }))).toStrictEqual([
      { id: "unfixtured-reference", path: join(REFERENCE_FILES_DIRECTORY, "unfixtured-reference.webp") },
    ]);
  });

  test("should place beside its snapshot the reference that renders the fixture as it is, over a props override listed after it", () => {
    expect.hasAssertions();

    const referenceMap = {
      "plain-reference": { screen: SCREEN_NAME, source: " " },
      "props-reference": { props: PROPS, screen: SCREEN_NAME, source: " " },
    } satisfies Record<string, ParityReference>;
    const plan = planReferenceFiles(referenceMap, [createFixtureRow("")], COMPONENTS_DIRECTORY);

    expect(plan.map(({ id, path }) => ({ id, path }))).toStrictEqual([
      { id: "plain-reference", path: getFixtureReferenceFilePath(join(COMPONENTS_DIRECTORY, "Foo", "Screen"), "") },
      { id: "props-reference", path: join(REFERENCE_FILES_DIRECTORY, "props-reference.webp") },
    ]);
  });
});
