import { COMPONENTS_DIRECTORY } from "#src/services/genshinParity/fixtures/constants";
import { REFERENCE_FILE_EXTENSION, REFERENCE_FILE_MAX_BYTES } from "#src/services/genshinParity/reference/constants";
import { readReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, test } from "vitest";

// The committed references are read from the tree: each one the map names has its file, each file is named by an entry
// or a manifest row, its bytes are the hash its row holds, and no file is larger than the ceiling
describe("committedReferences", () => {
  const COMMITTED_REFERENCE_SUFFIX = ".reference.webp";
  const toRepositoryPath = (path: string): string => relative(REPOSITORY_ROOT, path);
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

  test("commits a file for every reference the map names", async () => {
    expect.hasAssertions();

    const missing = (await readReferenceFiles())
      .filter(({ path }) => !existsSync(path))
      .map(({ id, path }) => `${id}: add its lossless WebP at ${toRepositoryPath(path)}`);

    expect(missing).toStrictEqual([]);
  });

  test("commits no file that no entry or manifest row names", async () => {
    expect.hasAssertions();

    const named = new Set([
      ...(await readReferenceFiles()).map(({ path }) => path),
      ...(await readReferenceManifest()).flatMap(({ id, plate }) =>
        plate === undefined ? [] : [getReferencePlateFilePath(id)],
      ),
    ]);
    const orphans = readCommittedFiles()
      .filter((path) => !named.has(path))
      .map(toRepositoryPath);

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
        if (sha256 === undefined || !existsSync(path)) return undefined;
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
      .map(toRepositoryPath);

    expect(oversized).toStrictEqual([]);
  });
});
