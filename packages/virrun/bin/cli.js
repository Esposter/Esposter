#!/usr/bin/env node
// Committed entry for the "virrun" bin: pnpm >= 11.15 refuses to link a bin shim whose target file is missing
// At install time, and the bundled dist/cli.js only exists after a build (gitignored, or a CI artifact downloaded
// After install). A committed wrapper keeps the shim linkable on a fresh install; the real CLI still lives in dist.
await import("../dist/cli.js");
