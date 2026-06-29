import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  ACCEPTANCE_TIMEOUT_MINUTES,
  ESBUILD_VERSION_REGEX,
  FIND_ESBUILD_BINARY_COMMAND,
  PNPM_MODULES_DIRECTORY,
  RUN_ESBUILD_VERSION_COMMAND,
} from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_HOME_KEY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Correctness layer 4 — snapshot/fork equivalence (features/virrun/specs/correctness.md). A forked warm
// Sandbox must behave identically to a freshly booted+installed one; fork must never drift from cold. This
// Is a true differential where the ONLY variable is how the dependency closure is presented to the run:
//   - warm: createSnapshot freezes the install into an overlay upper, then forkSnapshot stacks it read-only
//     As the sole lower with a fresh tmpfs upper.
//   - cold: one ephemeral session installs in place (writes land in the tmpfs upper) and then runs the same
//     Verify command over that in-place tree.
// The install output is discarded to /dev/null, so both results carry ONLY the verify command's observable
// Output — no normalization rules are needed, which is the strongest form: nothing is masked, so a real
// Overlay-layering divergence (a missing package, a binary the lower fails to expose) cannot be hidden.
// Heavy + networked during the install(s), so it self-gates exactly like the snapshot warm-fork acceptance:
// The snapshot cache is redirected under $HOME (not os.tmpdir) because the sandbox masks /tmp with --tmpfs,
// Which would hide a /tmp overlay layer from the command inside.
describe.skipIf(!isSandboxInstallSupported)("forkSnapshot - warm fork matches a cold in-place install (equivalence)", () => {
  let corpus = "";
  let cacheHome = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(() => {
    corpus = createWorkspaceCorpus(findRepoRoot());
    const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
    mkdirSync(cache, { recursive: true });
    cacheHome = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterAll(() => {
    // Drop the captured snapshot first, while the cache override is still active and the corpus lockfile (which
    // Keys the snapshot) still exists.
    if (corpus) removeSnapshotDirectory(resolveSnapshotLocation(corpus).dir);
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
    if (cacheHome) rmSync(cacheHome, { force: true, recursive: true });
  });

  test("a forked warm run produces the identical observable result as a cold in-place install", async () => {
    expect.hasAssertions();

    const backend = createOsBackend();
    // Deterministic proof the dependency closure is fully present and usable: hash the sorted top-level .pnpm
    // Listing (catches a fork that exposes a different package set than an in-place install), then run esbuild's
    // Native binary and print its version (catches a fork that fails to expose the native binary through the
    // Lower). Output is relative to node_modules and version-only, so it leaks no absolute path and is identical
    // On both sides when — and only when — the two presentations of the closure are equivalent.
    const verifyCommand = [
      `test -d ${PNPM_MODULES_DIRECTORY}`,
      `find ${PNPM_MODULES_DIRECTORY} -maxdepth 1 | LC_ALL=C sort | sha256sum`,
      FIND_ESBUILD_BINARY_COMMAND,
      'test -n "$ESBUILD"',
      RUN_ESBUILD_VERSION_COMMAND,
    ].join(" && ");

    // Warm: capture the install once into the frozen snapshot upper, then fork the verify over it. The fork
    // Reuses the dep tree (no reinstall) with the upper stacked read-only beside the source.
    await createSnapshot(backend, resolveSetupCommand(), createOsInstallOptions(corpus, "pipe"));
    const warmResult = await forkSnapshot(backend, verifyCommand, createOsExecOptions(corpus, "pipe"));

    // Cold: a fresh ephemeral session installs in place (the same install command the capture ran) and then runs
    // The same verify over that in-place tree. The install reuses the now-warm shared store, so this is a near-warm
    // Copy rather than a second cold fetch. Install output is discarded so only the verify result remains to diff.
    const coldResult = await backend.exec(
      `${resolveSetupCommand()} > /dev/null 2>&1 && ${verifyCommand}`,
      createOsInstallOptions(corpus, "pipe"),
    );

    // Both genuinely succeeded (not equal failures), the native binary actually ran (not equal-empty), and the
    // Fork drifted from cold in no observable way.
    expect(warmResult.exitCode).toBe(0);
    expect(coldResult.exitCode).toBe(0);
    expect(warmResult.stdout).toMatch(ESBUILD_VERSION_REGEX);
    expect(warmResult).toStrictEqual(coldResult);
    // Both heavy installs run inside the sandbox on a possibly-slow host; allow the long acceptance timeout.
  }, dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds());
});
