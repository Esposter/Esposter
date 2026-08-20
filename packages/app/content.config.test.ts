import { DOCS_DIRECTORY } from "@esposter/configuration";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const configuration = await readFile(join(import.meta.dirname, "content.config.ts"), "utf8");

// `nuxt prepare` runs from `postinstall`, before any workspace package is built, so this config cannot import the
// Constant — a fresh install has no `@esposter/configuration/dist` to resolve and the whole install fails. It
// Therefore repeats the literal, and this is the only thing holding that copy to its owner: a rename would leave
// The collection reading a directory that no longer exists, with every docs page silently absent from the site.
describe("contentConfiguration", () => {
  test("reads the docs collection from the directory the constant names", () => {
    expect.hasAssertions();

    expect(configuration).toContain(`source: "${DOCS_DIRECTORY}/**/*.md"`);
  });
});
