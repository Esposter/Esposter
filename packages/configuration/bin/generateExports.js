#!/usr/bin/env node
// Committed entry for the "generate-exports" bin every package's `export:gen` runs: pnpm >= 11.15 refuses
// To link a bin shim whose target file is missing at install time, and this package's `dist` only exists after a
// Build (gitignored, or a CI artifact downloaded after install). A committed wrapper keeps the shim linkable on a
// Fresh install; the generation itself stays in `dist`, in the same function the build hook calls.
//
// Which is also why the build is checked for rather than assumed: on a fresh clone this is reachable before
// Anything has been built, and Node's own `ERR_MODULE_NOT_FOUND` names a path inside a package the caller never
// Mentioned. The same shape as `getCtixCommandPath`, for the same reason.
//
// The argument is passed through as it arrives, absent included: the default and the check on it belong to that
// One function rather than to this wrapper, which is the only reason this file can stay a line long.
import { existsSync } from "node:fs";

const distributionUrl = new URL("../dist/index.js", import.meta.url);

if (!existsSync(distributionUrl))
  throw new Error("@esposter/configuration has no build to generate from: run `pnpm build` there first");

const { generateExports } = await import(distributionUrl);

generateExports(process.argv[2]);
