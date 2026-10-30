import { COMPONENTS_DIRECTORY, REFERENCE_IMAGE_SUFFIX } from "#src/services/genshinParity/fixtures/constants";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { REFERENCE_FILE_EXTENSION, REFERENCE_FILE_MAX_BYTES } from "#src/services/genshinParity/reference/constants";
import { getVariantEntries } from "#src/services/genshinParity/reference/getVariantEntries";
import { readReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getFixtureReferenceFilePath } from "#src/services/genshinParity/shared/getFixtureReferenceFilePath";
import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, test } from "vitest";

const toRepositoryPath = (path: string): string => relative(REPOSITORY_ROOT, path);

// The plate of every reference a manifest row or a map entry names one for, at the path its id gives
const readNamedPlates = async (): Promise<{ id: string; path: string }[]> => {
  const rows = await readReferenceManifest();
  const ids = new Set([
    ...rows.filter(({ plate }) => plate !== undefined).map(({ id }) => id),
    ...Object.entries(ParityReferenceMap)
      .filter(([, { pending, plateSource }]) => pending === undefined && plateSource !== undefined)
      .map(([id]) => id),
  ]);
  return Array.from(ids, (id) => ({ id, path: getReferencePlateFilePath(id) }));
};

// The committed references are read from the tree.
// Each one the map names has its file, and each fixture variant holding one has exactly one beside its snapshot.
// Each file is named by an entry or a manifest row, and its bytes are the hash its row holds.
// No file is larger than the ceiling
describe("committedReferences", () => {
  const COMMITTED_REFERENCE_SUFFIX = `${REFERENCE_IMAGE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`;
  // Every committed file: the flat ones in the references folder, and the ones beside a fixture variant's snapshot
  const readCommittedFiles = (): string[] => [
    ...readdirSync(REFERENCE_FILES_DIRECTORY)
      .filter((name) => extname(name) === `.${REFERENCE_FILE_EXTENSION}`)
      .map((name) => join(REFERENCE_FILES_DIRECTORY, name)),
    ...readdirSync(COMPONENTS_DIRECTORY, { recursive: true })
      .map(String)
      .filter((path) => path.endsWith(COMMITTED_REFERENCE_SUFFIX))
      .map((path) => join(COMPONENTS_DIRECTORY, path)),
  ];

  test("commits a file for every reference the map names, and a plate for every one that names one", async () => {
    expect.hasAssertions();

    const missing = [
      ...(await readReferenceFiles())
        .filter(({ path }) => !existsSync(path))
        .map(({ id, path }) => `${id}: add its lossless WebP at ${toRepositoryPath(path)}`),
      ...(await readNamedPlates())
        .filter(({ path }) => !existsSync(path))
        .map(({ id, path }) => `${id}: add its plate's lossless WebP at ${toRepositoryPath(path)}`),
    ];

    expect(missing).toStrictEqual([]);
  });

  test("places one reference beside each fixture variant that holds one, and no other beside its snapshot", async () => {
    expect.hasAssertions();

    const plan = await readReferenceFiles();
    const planned = Object.fromEntries(plan.map(({ id, reference }) => [id, reference]));
    const rows = await listFixtureScreens(COMPONENTS_DIRECTORY, ParityReferenceMap, new Map());
    const expected = rows
      .filter(({ name, variant }) => getVariantEntries(planned, name, variant).length > 0)
      .map(({ directory, variant }) => getFixtureReferenceFilePath(join(COMPONENTS_DIRECTORY, directory), variant));
    const beside = plan.map(({ path }) => path).filter((path) => path.startsWith(COMPONENTS_DIRECTORY));

    expect(beside.toSorted()).toStrictEqual(expected.toSorted());
  });

  test("commits no file that no entry or manifest row names", async () => {
    expect.hasAssertions();

    const named = new Set([
      ...(await readReferenceFiles()).map(({ path }) => path),
      ...(await readNamedPlates()).map(({ path }) => path),
    ]);
    const orphans = readCommittedFiles()
      .filter((path) => !named.has(path))
      .map((path) => toRepositoryPath(path));

    expect(orphans).toStrictEqual([]);
  });

  test("holds each committed file's bytes under the hash its manifest row names", async () => {
    expect.hasAssertions();

    const rows = await readReferenceManifest();
    const expected = [
      ...(await readReferenceFiles()).map(({ id, path }) => ({
        id,
        path,
        sha256: rows.find((row) => row.id === id)?.sha256,
      })),
      ...rows.flatMap(({ id, plate }) =>
        plate === undefined ? [] : [{ id, path: getReferencePlateFilePath(id), sha256: plate.sha256 }],
      ),
    ];
    const problems = await Promise.all(
      expected.map(async ({ id, path, sha256 }) => {
        // A file no row names is the existence test's to report; a file a row names must be on disk to hold the row's bytes
        if (!existsSync(path))
          return sha256 === undefined
            ? undefined
            : `${id}: ${toRepositoryPath(path)} is named by its manifest row, but absent`;
        if (sha256 === undefined) return `${id}: ${toRepositoryPath(path)} has no manifest row`;
        return (await sha256File(path)) === sha256
          ? undefined
          : `${id}: ${toRepositoryPath(path)} differs from its manifest row`;
      }),
    );

    expect(problems.filter((problem) => problem !== undefined)).toStrictEqual([]);
  });

  test("keeps every committed file under the size ceiling", () => {
    expect.hasAssertions();

    const oversized = readCommittedFiles()
      .filter((path) => statSync(path).size > REFERENCE_FILE_MAX_BYTES)
      .map((path) => toRepositoryPath(path));

    expect(oversized).toStrictEqual([]);
  });
});
