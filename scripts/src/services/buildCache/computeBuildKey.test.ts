import { computeBuildKey } from "#src/services/buildCache/computeBuildKey";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const LOCKFILE = `lockfileVersion: '9.0'

importers:

  .:
    dependencies: {}

  packages/a:
    dependencies:
      b:
        specifier: workspace:*
        version: link:../b
      left-pad:
        specifier: 1.0.0
        version: 1.0.0

  packages/b:
    dependencies: {}

packages: {}

snapshots:

  left-pad@1.0.0:
    dependencies:
      inner: 2.0.0

  inner@2.0.0: {}
`;

describe(computeBuildKey, () => {
  let repositoryRoot: string;
  const writeRepositoryFile = (path: string, content: string) => {
    const filePath = join(repositoryRoot, path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  };
  const getKey = () => computeBuildKey(join(repositoryRoot, "packages/a"), repositoryRoot);

  beforeAll(() => {
    repositoryRoot = mkdtempSync(join(tmpdir(), "build-cache-"));
    writeRepositoryFile("pnpm-lock.yaml", LOCKFILE);
    writeRepositoryFile(".node-version", "26.10.0\n");
    writeRepositoryFile("packages/a/package.json", '{ "name": "a" }');
    writeRepositoryFile("packages/a/src/index.ts", "export const a = 1;\n");
    writeRepositoryFile("packages/b/package.json", '{ "name": "b" }');
    writeRepositoryFile("packages/b/src/index.ts", "export const b = 1;\n");
  });

  afterAll(() => {
    rmSync(repositoryRoot, { force: true, recursive: true });
  });

  test("the key is the same for the same inputs", () => {
    expect.hasAssertions();

    expect(getKey()).toBe(getKey());
  });

  test("changing one byte of the package's source changes its key", () => {
    expect.hasAssertions();

    const before = getKey();
    writeRepositoryFile("packages/a/src/index.ts", "export const a = 2;\n");

    expect(getKey()).not.toBe(before);
    writeRepositoryFile("packages/a/src/index.ts", "export const a = 1;\n");
  });

  test("changing a workspace dependency's source changes the dependent's key", () => {
    expect.hasAssertions();

    const before = getKey();
    writeRepositoryFile("packages/b/src/index.ts", "export const b = 2;\n");

    expect(getKey()).not.toBe(before);
    writeRepositoryFile("packages/b/src/index.ts", "export const b = 1;\n");
  });

  test("a transitive version change in the lockfile changes the key while the importer is unchanged", () => {
    expect.hasAssertions();

    const before = getKey();
    writeRepositoryFile(
      "pnpm-lock.yaml",
      LOCKFILE.replace("inner: 2.0.0", "inner: 2.0.1").replace("inner@2.0.0: {}", "inner@2.0.1: {}"),
    );

    expect(getKey()).not.toBe(before);
    writeRepositoryFile("pnpm-lock.yaml", LOCKFILE);
  });

  test("touching a file without changing its bytes keeps the key", () => {
    expect.hasAssertions();

    const before = getKey();
    const sourcePath = join(repositoryRoot, "packages/a/src/index.ts");
    const past = new Date(0);
    utimesSync(sourcePath, past, past);

    expect(getKey()).toBe(before);
    expect(readFileSync(sourcePath, "utf8")).toBe("export const a = 1;\n");
  });
});
