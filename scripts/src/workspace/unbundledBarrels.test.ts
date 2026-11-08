import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import { describe, expect, onTestFinished, test } from "vitest";

/**
 * A package builds one file per module, so a consumer's bundler drops every module an import does not reach. The
 * schema package is the one that matters: its barrel holds drizzle tables and the schemas derived from them, and
 * the client imports its enums. A package built into one file keeps all of that for a single enum, so this bundles
 * the import the way the app's client does and reads what survives.
 */
describe("unbundledBarrels", () => {
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
});
