import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";

import { dayjs } from "@/services/dayjs.test";
import { computeTaskCacheKey } from "@/services/exec/cache/computeTaskCacheKey";
import { persistWithCache } from "@/services/exec/cache/persistWithCache";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { ACCEPTANCE_TIMEOUT_MINUTES } from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { ensureWarmSnapshot } from "@/services/exec/test/ensureWarmSnapshot.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { getAcceptanceCacheHome } from "@/services/exec/test/getAcceptanceCacheHome";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { CI_ENV_KEY, VIRRUN_CACHE_HOME_KEY, VIRRUN_NO_CACHE_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Task-cache equivalence (specs/config-and-cache.md): a cache HIT is observably identical to the MISS that recorded
// It — same exit code, stdout, stderr, and produced host files — while skipping the sandbox entirely. The command's
// Output is written to a gitignored path so it never perturbs the source-tree hash, keeping the key stable across
// The miss→hit pair (the real dev-loop shape: build output like dist/.nuxt is gitignored).
describe.skipIf(!isSandboxInstallSupported)(
  "persistWithCache - a hit replays a recorded run identically (task-cache equivalence)",
  () => {
    let backend: ExecBackend;
    // Counts real sandbox executions so a hit can be proven to skip exec, not merely reproduce its output.
    let execCount = 0;
    let countingBackend: ExecBackend;
    const acceptanceTimeoutMs = dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds();
    let corpus = "";
    const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];
    const previousCi = process.env[CI_ENV_KEY];
    const previousNoCache = process.env[VIRRUN_NO_CACHE_KEY];
    // Print to stdout AND produce a gitignored file, so the recorded result exercises both stream replay and file flush.
    const command = `printf " "; printf " " > ${TEST_FILENAME}`;
    const runCached = (): Promise<{ exitCode: number; stderr: string; stdout: string }> =>
      persistWithCache(countingBackend, command, createOsExecOptions(corpus, "pipe"));

    beforeAll(async () => {
      backend = createOsBackend();
      countingBackend = {
        exec: (targetCommand: readonly string[] | string, options: ExecOptions) => {
          execCount++;
          return backend.exec(targetCommand, options);
        },
        name: backend.name,
      };
      process.env[VIRRUN_CACHE_HOME_KEY] = getAcceptanceCacheHome();
      // The task cache is off in CI / under the opt-out; force it on for the assertions regardless of the host env.
      delete process.env[CI_ENV_KEY];
      delete process.env[VIRRUN_NO_CACHE_KEY];
      corpus = createWorkspaceCorpus(findRepoRoot());
      // The corpus must be a git repo for the source-tree hash, and the produced file must be gitignored so it does not
      // Move the key between the miss and the hit.
      execFileSync("git", ["init", "-q"], { cwd: corpus });
      writeFileSync(join(corpus, ".gitignore"), `${TEST_FILENAME}\n`);
      await ensureWarmSnapshot(backend, corpus);
    }, acceptanceTimeoutMs);

    afterAll(() => {
      if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
      else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
      if (previousCi === undefined) delete process.env[CI_ENV_KEY];
      else process.env[CI_ENV_KEY] = previousCi;
      if (previousNoCache === undefined) delete process.env[VIRRUN_NO_CACHE_KEY];
      else process.env[VIRRUN_NO_CACHE_KEY] = previousNoCache;
      if (corpus) rmSync(corpus, { force: true, recursive: true });
    });

    test(
      "records on a miss, then replays an identical result without re-executing the sandbox",
      async () => {
        expect.hasAssertions();

        const key = computeTaskCacheKey(command, corpus);

        // Guard: a null key would silently fall back to uncached, making the hit assertion meaningless.
        expect(key).not.toBeNull();

        execCount = 0;
        const miss = await runCached();

        expect(miss.exitCode).toBe(0);
        expect(miss.stdout).toBe(" ");
        expect(execCount).toBe(1);
        expect(resolveTaskCacheLocation(key ?? "").exists).toBe(true);

        // Remove the produced output so the replay must re-materialise it (and the source tree matches the miss exactly).
        rmSync(join(corpus, TEST_FILENAME), { force: true });
        execCount = 0;
        const hit = await runCached();

        // The hit is observably identical to the miss...
        expect(hit).toStrictEqual(miss);
        // ...its produced file is reconciled onto the host...
        expect(existsSync(join(corpus, TEST_FILENAME))).toBe(true);
        // ...and it never touched the sandbox.
        expect(execCount).toBe(0);
      },
      acceptanceTimeoutMs,
    );
  },
);
