import type { PackageManifest } from "@esposter/configuration";

import { getFileSize } from "@esposter/configuration";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/azure-functions", () => {
  const packageDirectory = resolve(import.meta.dirname, "..");
  const distFile = resolve(packageDirectory, "dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4879.46 KB (4996567 bytes)"`);
  });

  // The Functions host loads a v4-model app by reading "main", and never consults the generated exports map, so
  // This is the one package where the field is a host contract rather than a resolver's legacy fallback. Nothing
  // Else reads it: no import resolves through it, the package is private so publint never runs, and typecheck,
  // Lint and every other test pass without it. Losing it registers zero functions on a host that still reports
  // Running, which stops every trigger silently — the build migration did exactly that by replacing the field
  // With the generated map. Read from this package's own manifest rather than the cwd's, because the suite runs
  // From the repo root as well as from here
  test("declares the entry point the Functions host loads", () => {
    expect.hasAssertions();
    // eslint-disable-next-line no-restricted-syntax -- a package manifest carries no dates, so reviving them would only cost a pass over it
    const { main } = JSON.parse(readFileSync(resolve(packageDirectory, "package.json"), "utf8")) as PackageManifest;

    expect(main).toBe("dist/index.js");
    expect(existsSync(resolve(packageDirectory, main ?? ""))).toBe(true);
  });
});
