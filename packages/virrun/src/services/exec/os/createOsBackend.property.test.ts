import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import * as fc from "fast-check";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// Correctness layer 5 — property/fuzz, second half (features/virrun/specs/correctness.md). The vfs half fuzzes FS
// Ops against a node:fs oracle; this half fuzzes randomized *command* sequences against the os backend and proves
// The sandbox state never corrupts under any ordering. The os backend gives each exec a fresh RAM overlay — reads
// Fall through to the source, writes vanish in tmpfs — so the invariants are structural, not an oracle diff:
//   1. Host isolation — no command, in any sequence, mutates the host working dir. The seeded canary keeps its
//      baseline content and is never deleted; files a command writes/mkdirs land only in the ephemeral upper, so
//      they never appear on the host disk.
//   2. No cross-exec leakage — because every exec gets a fresh upper, a write/append/delete from an earlier
//      command is invisible to a later one. A final fresh read of the canary always sees the source baseline,
//      never a mid-sequence write. A corrupted overlay (a leaked upper, or a delete propagating to the source)
//      is the only way this breaks.
//   3. Well-formedness — every command yields a finite exit code and string stdio; the sandbox never wedges or
//      rejects (a reject throws out of the property → a shrunk counterexample), regardless of the ordering.
// Real subprocesses (bwrap on Linux, the WSL bridge on Windows), so it is host-gated and kept to small run counts;
// Fast-check still shrinks a failing sequence to its minimal counterexample, the whole reason to fuzz rather than
// Hand-roll a fixed ordering.

// The canary is seeded empty (""), so any cross-exec write leak surfaces as a non-empty read; "x" is the distinct
// Non-empty marker (a bare token, not " ", to stay free of shell-quoting fragility across the bwrap/WSL hops).
const CANARY = "a";
// Never seeded on the host — a command that writes it must leave the host disk untouched.
const SCRATCH_FILE = "b";
// Never created on the host — a mkdir must land only in the ephemeral upper.
const SCRATCH_DIR = "d";
const LEAK_MARKER = "x";

const toCommand = (operation: { file: string; kind: string }): string => {
  if (operation.kind === "write") return `printf ${LEAK_MARKER} > ${operation.file}`;
  else if (operation.kind === "append") return `printf ${LEAK_MARKER} >> ${operation.file}`;
  else if (operation.kind === "delete") return `rm -f ${operation.file}`;
  else if (operation.kind === "read") return `cat ${operation.file} 2>/dev/null || true`;
  else if (operation.kind === "mkdir") return `mkdir -p ${SCRATCH_DIR}`;
  else return `exit 1`;
};

describe.skipIf(!isOsBackendSupported())(createOsBackend, () => {
  const temporaryDirectories = createTemporaryDirectoryTracker();
  const fileArb = fc.constantFrom(CANARY, SCRATCH_FILE);
  const operationArb = fc.oneof(
    fc.record({ file: fileArb, kind: fc.constant("write") }),
    fc.record({ file: fileArb, kind: fc.constant("append") }),
    fc.record({ file: fileArb, kind: fc.constant("delete") }),
    fc.record({ file: fileArb, kind: fc.constant("read") }),
    fc.record({ file: fc.constant(SCRATCH_DIR), kind: fc.constant("mkdir") }),
    fc.record({ file: fc.constant(""), kind: fc.constant("fail") }),
  );

  afterEach(() => {
    temporaryDirectories.cleanup();
  });

  test("randomized command sequences never corrupt sandbox state", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();

    await fc.assert(
      fc.asyncProperty(fc.array(operationArb, { maxLength: 5, minLength: 1 }), async (operations) => {
        const directory = temporaryDirectories.create();
        writeFileSync(join(directory, CANARY), "");

        for (const operation of operations) {
          const { exitCode, stderr, stdout } = await exec(toCommand(operation), { cwd: directory, stdio: "pipe" });
          // Well-formedness: a real command result, never a wedged sandbox.
          expect(Number.isInteger(exitCode)).toBe(true);
          expect(typeof stdout).toBe("string");
          expect(typeof stderr).toBe("string");
        }

        // Host isolation: the canary survives unmodified, and nothing a command wrote/mkdir'd reached the host.
        expect(existsSync(join(directory, CANARY))).toBe(true);
        expect(readFileSync(join(directory, CANARY), "utf8")).toBe("");
        expect(existsSync(join(directory, SCRATCH_FILE))).toBe(false);
        expect(existsSync(join(directory, SCRATCH_DIR))).toBe(false);

        // No cross-exec leakage: a fresh upper sees the source baseline, never a mid-sequence write to the canary.
        const finalRead = await exec(`cat ${CANARY}`, { cwd: directory, stdio: "pipe" });
        expect(finalRead.exitCode).toBe(0);
        expect(finalRead.stdout).toBe("");
      }),
      { numRuns: 10 },
    );
  });
});
