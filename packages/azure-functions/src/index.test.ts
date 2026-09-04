import type { PackageManifest } from "@esposter/configuration";

import { getFileSize } from "@esposter/configuration";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/azure-functions", () => {
  const REGISTRATION_REGEX = /app\.(?:eventGrid|http|serviceBusQueue|timer)\(/gu;
  const HOOK_REGISTRATION_REGEX = /app\.hook\.\w+\(/gu;
  const packageDirectory = resolve(import.meta.dirname, "..");
  const distFile = resolve(packageDirectory, "dist/index.js");
  const readRegistrationCount = (directory: string) =>
    readdirSync(resolve(packageDirectory, "src", directory)).filter((entry) => entry.endsWith(".ts")).length;

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 5010.20 KB (5130445 bytes)"`);
  });

  // The Functions host loads a v4-model app by reading "main", and never consults the generated exports map, so
  // This is the one package where the field is a host contract rather than a resolver's legacy fallback. The
  // Build generates it — `exports: { legacy: true }` writes the ESM chunk into "main" for a package with no CJS
  // Output — and nothing else reads it: no import resolves through it, the package is private so publint never
  // Runs, and typecheck, lint and every other test pass without it. Losing it registers zero functions on a host
  // That still reports Running, which stops every trigger silently — the build migration did exactly that by
  // Replacing the field with the generated map. Read from this package's own manifest rather than the cwd's,
  // Because the suite runs from the repo root as well as from here
  test("declares the entry point the Functions host loads", () => {
    expect.hasAssertions();
    // eslint-disable-next-line no-restricted-syntax -- a package manifest carries no dates, so reviving them would only cost a pass over it
    const { main } = JSON.parse(readFileSync(resolve(packageDirectory, "package.json"), "utf8")) as PackageManifest;

    expect(main).toBe("./dist/index.js");
    expect(existsSync(resolve(packageDirectory, main ?? ""))).toBe(true);
  });

  // Every function is registered by a bare app.* call whose result nothing uses, and `export default {}` leaves
  // The module without a named export for the barrel to keep alive either — so the registration is a pure side
  // Effect, and a bundler told the package has none tree-shakes all of them away. The dist then exports the
  // Handlers, imports nothing from the host, and registers no functions: an app that deploys, starts, reports
  // Running and never runs a trigger again. Counting them against the source files is what catches that, and
  // Nothing else can — the bundle still loads, and every other test imports source rather than dist
  test("registers one function per source file in the bundle", () => {
    expect.hasAssertions();

    expect(readFileSync(distFile, "utf8").match(REGISTRATION_REGEX)).toHaveLength(readRegistrationCount("functions"));
  });

  // An app-level hook is registered by the same bare, result-unused `app.*` call as a trigger, so it tree-shakes
  // Away in exactly the same silence — and the one hook here is the recovery for an app that registered nothing,
  // Which is precisely the failure that must not depend on itself surviving the bundler
  test("registers one hook per source file in the bundle", () => {
    expect.hasAssertions();

    expect(readFileSync(distFile, "utf8").match(HOOK_REGISTRATION_REGEX)).toHaveLength(readRegistrationCount("hooks"));
  });
});
