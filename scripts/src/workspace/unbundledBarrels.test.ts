import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readTsdownPackagePaths } from "#src/workspace/readTsdownPackagePaths.test";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import { describe, expect, onTestFinished, test } from "vitest";

/**
 * A package builds one file per module, so a consumer's bundler drops every module an import does not reach. The
 * schema package is the one that matters: its barrel holds drizzle tables and the schemas derived from them, and
 * the client imports its enums. A package built into one file keeps all of that for a single enum, so this bundles
 * the import the way the app's client does and reads what survives. The other two tests hold the shape of the output
 * itself: it is moved between machines and loaded by Node, which neither a stylesheet import nor a hidden folder survives.
 */
describe("unbundledBarrels", () => {
  // Matches a module's import of a stylesheet, bare or with bindings, which a bundler resolves and Node cannot load
  const STYLESHEET_IMPORT_REGEX = /^import\s+(?:[^;]*?\sfrom\s+)?["'][^"']+\.css["']/mu;
  const PACKAGE_PATHS = readTsdownPackagePaths();
  const readDistDirectory = (packagePath: string) => resolve(REPOSITORY_ROOT, packagePath, "dist");

  const DB_SCHEMA_ENTRY = pathToFileURL(resolve(REPOSITORY_ROOT, "packages/db-schema/dist/index.js")).href;

  test("an import of one enum loads no drizzle", async () => {
    expect.hasAssertions();

    const directory = mkdtempSync(join(tmpdir(), "unbundled-barrels-"));
    onTestFinished(() => {
      rmSync(directory, { force: true, recursive: true });
    });
    const entry = join(directory, "entry.js");
    writeFileSync(
      entry,
      `import { MessageType } from ${JSON.stringify(DB_SCHEMA_ENTRY)};\nconsole.log(MessageType);\n`,
    );
    const output = await build({
      build: { minify: false, rollupOptions: { input: entry }, write: false },
      configFile: false,
      logLevel: "silent",
      root: directory,
    });
    const results = Array.isArray(output) ? output : [output];
    const code = results
      .flatMap((result) => ("output" in result ? result.output : []))
      .map((chunk) => ("code" in chunk ? chunk.code : ""))
      .join("\n");

    expect(code).toContain("MessageType");
    expect(code).not.toContain("pgTable");
  }, 60_000);

  // CI uploads each package's `dist` as an artifact that skips a hidden folder by default, so a vendored file under
  // pnpm's `.pnpm` was missing from the app build and its import of the file failed to resolve
  test("a build writes no folder a tool skips as hidden", () => {
    expect.hasAssertions();

    const hiddenPaths = PACKAGE_PATHS.flatMap((packagePath) => {
      const distDirectory = readDistDirectory(packagePath);
      if (!existsSync(distDirectory)) return [];
      return readdirSync(distDirectory, { recursive: true, withFileTypes: true })
        .filter(({ name }) => name.startsWith("."))
        .map(({ name, parentPath }) => `${packagePath}: ${resolve(parentPath, name).slice(distDirectory.length + 1)}`);
    });

    expect(hiddenPaths).toStrictEqual([]);
  });

  // The scripts and benchmarks read a Vue package's data through its `dist` under plain Node, which fails on a `.css`
  // File as if it were JavaScript, so a package's stylesheets are merged into its one `style.css` and no module imports one
  test("no built module imports a stylesheet", () => {
    expect.hasAssertions();

    const stylesheetImporters = PACKAGE_PATHS.flatMap((packagePath) => {
      const distDirectory = readDistDirectory(packagePath);
      if (!existsSync(distDirectory)) return [];
      return readdirSync(distDirectory, { recursive: true, withFileTypes: true })
        .filter(({ name }) => name.endsWith(".js"))
        .map(({ name, parentPath }) => resolve(parentPath, name))
        .filter((file) => STYLESHEET_IMPORT_REGEX.test(readFileSync(file, "utf8")))
        .map((file) => `${packagePath}: ${file.slice(distDirectory.length + 1)}`);
    });

    expect(stylesheetImporters).toStrictEqual([]);
  });
});
