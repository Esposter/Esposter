import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { ACCEPTANCE_TIMEOUT_MINUTES } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import * as fc from "fast-check";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// Correctness layer 5 property/fuzz, os half (specs/correctness.md): fast-check drives randomized command sequences
// And asserts the structural isolation invariants hold under every ordering —
//   1. Host isolation — no command mutates the host working dir (the seeded canary keeps its baseline).
//   2. No cross-exec leakage — each exec gets a fresh upper, so a final read of the canary sees the source baseline.
//   3. Well-formedness — every command yields a finite exit code + string stdio; the sandbox never wedges.
// Real subprocesses, so host-gated and kept to small run counts.

describe.skipIf(!checkIsOsBackendSupported())(createOsBackend, () => {
  // Seeded empty, so any cross-exec write leak surfaces as a non-empty read.
  const CANARY = "a";
  // Never seeded on the host — a command that writes it must leave the host disk untouched.
  const SCRATCH_FILE = "b";
  // Never created on the host — a mkdir must land only in the ephemeral upper.
  const SCRATCH_DIRECTORY = "d";

  // Write/append the file's own name as its (non-empty) content — a bare token, so the command stays unquoted without
  // Shell-quoting fragility across the bwrap/WSL hops.
  const toCommand = (operation: { file: string; kind: string }): string => {
    switch (operation.kind) {
      case "append":
        return `printf ${operation.file} >> ${operation.file}`;
      case "delete":
        return `rm -f ${operation.file}`;
      case "mkdir":
        return `mkdir -p ${SCRATCH_DIRECTORY}`;
      case "read":
        return `cat ${operation.file} 2>/dev/null || true`;
      case "write":
        return `printf ${operation.file} > ${operation.file}`;
      default:
        return `exit 1`;
    }
  };

  const temporaryDirectories = createTemporaryDirectoryTracker();
  const fileArbitrary = fc.constantFrom(CANARY, SCRATCH_FILE);
  const operationArbitrary = fc.oneof(
    fc.record({ file: fileArbitrary, kind: fc.constant("write") }),
    fc.record({ file: fileArbitrary, kind: fc.constant("append") }),
    fc.record({ file: fileArbitrary, kind: fc.constant("delete") }),
    fc.record({ file: fileArbitrary, kind: fc.constant("read") }),
    fc.record({ file: fc.constant(SCRATCH_DIRECTORY), kind: fc.constant("mkdir") }),
    fc.record({ file: fc.constant(""), kind: fc.constant("fail") }),
  );

  afterEach(() => {
    temporaryDirectories.cleanup();
  });

  test(
    "randomized command sequences never corrupt sandbox state",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();

      await fc.assert(
        fc.asyncProperty(fc.array(operationArbitrary, { maxLength: 5, minLength: 1 }), async (operations) => {
          const directory = temporaryDirectories.create();
          writeFileSync(join(directory, CANARY), "");

          for (const operation of operations) {
            const { exitCode, stderr, stdout } = await exec(toCommand(operation), { cwd: directory, stdio: "pipe" });

            // Well-formedness: a real command result, never a wedged sandbox.
            expect(Number.isInteger(exitCode)).toBe(true);
            expect(stdout).toBeTypeOf("string");
            expect(stderr).toBeTypeOf("string");
          }

          // Host isolation: the canary survives unmodified, and nothing a command wrote/mkdir'd reached the host.
          expect(existsSync(join(directory, CANARY))).toBe(true);
          expect(readFileSync(join(directory, CANARY), "utf8")).toBe("");
          expect(existsSync(join(directory, SCRATCH_FILE))).toBe(false);
          expect(existsSync(join(directory, SCRATCH_DIRECTORY))).toBe(false);

          // No cross-exec leakage: a fresh upper sees the source baseline, never a mid-sequence write to the canary,
          // And the scratch artifacts a prior exec may have written/mkdir'd are absent inside the sandbox too — not
          // Just on the host — so a leaked upper (the only way isolation breaks) cannot slip past unread.
          const finalRead = await exec(`cat ${CANARY}`, { cwd: directory, stdio: "pipe" });

          expect(finalRead.exitCode).toBe(0);
          expect(finalRead.stdout).toBe("");

          const freshScratchCheck = await exec(`test ! -e ${SCRATCH_FILE} && test ! -d ${SCRATCH_DIRECTORY}`, {
            cwd: directory,
            stdio: "pipe",
          });

          expect(freshScratchCheck.exitCode).toBe(0);
        }),
        { numRuns: 10 },
      );
    },
    Temporal.Duration.from({ minutes: ACCEPTANCE_TIMEOUT_MINUTES }).total("milliseconds"),
  );
});
