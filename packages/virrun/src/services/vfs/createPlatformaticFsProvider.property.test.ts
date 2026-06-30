import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { createPlatformaticFsProvider } from "@/services/vfs/createPlatformaticFsProvider";
import { getResult, withFinalizer } from "@esposter/shared";
import * as fc from "fast-check";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// Correctness layer 5 — property/fuzz (features/virrun/specs/correctness.md). fast-check generates randomized
// FS operation sequences; each op runs against BOTH the vfs provider and a real node:fs temp directory, and the
// Two observable outcomes must be identical. node:fs is the oracle — its semantics are never re-implemented here,
// So a divergence is a real correctness bug in the provider, not a flaw in a hand-written model. When a sequence
// Fails, fast-check shrinks it to the minimal counterexample, which is the whole reason to lean on the library
// Rather than a hand-rolled PRNG walk. Pure in-memory (the provider is never mounted), so it runs everywhere.
// The "d" sub-directory is pre-created on both sides so every write's parent exists by construction; that keeps
// The compared scope to file read/write/exists semantics, where the provider must match native exactly.

// Normalize any op to a value comparable across the two filesystems: the success value, or a thrown marker.
// Building outcomes outside the branch lets the whole randomized trace be diffed in one unconditional assert.
const toOutcome = (operation: () => boolean | string): { ok: boolean; value: boolean | null | string } =>
  getResult(operation).match(
    (value) => ({ ok: true, value }),
    () => ({ ok: false, value: null }),
  );

describe(createPlatformaticFsProvider, () => {
  const temporaryDirectories = createTemporaryDirectoryTracker();
  // Absolute virtual root the provider operates under (POSIX-style; the provider's fs is virtual, not host-disk).
  const VROOT = "/p";
  // A pre-created sub-directory plus the never-written paths ("z", "d/z") that exercise the missing-file branch.
  const fileArb = fc.constantFrom("f", "g", "d/f", "d/g", "z", "d/z");
  // Canonical diff values: "" as the base, " " as a distinct second value.
  const contentArb = fc.constantFrom("", " ");
  const operationArb = fc.oneof(
    fc.record({ content: contentArb, kind: fc.constant("write"), rel: fileArb }),
    fc.record({ kind: fc.constant("read"), rel: fileArb }),
    fc.record({ kind: fc.constant("exists"), rel: fileArb }),
  );

  afterEach(() => {
    temporaryDirectories.cleanup();
  });

  test("randomized read/write/exists sequences match node:fs exactly", () => {
    expect.hasAssertions();

    fc.assert(
      fc.property(fc.array(operationArb, { maxLength: 48, minLength: 1 }), (operations) => {
        // Each fast-check run (including replay/shrinking) allocates its own provider + temp dir and frees them
        // In the finalizer, so the randomized trace never stacks allocations across the run's many iterations.
        const provider = createPlatformaticFsProvider();
        const directory = temporaryDirectories.create();
        withFinalizer(
          () => {
            provider.mkdir(`${VROOT}/d`);
            mkdirSync(join(directory, "d"), { recursive: true });
            const virtualTrace = [];
            const realTrace = [];

            for (const operation of operations) {
              const virtualPath = `${VROOT}/${operation.rel}`;
              const realPath = join(directory, operation.rel);
              if (operation.kind === "write") {
                const { content } = operation;
                virtualTrace.push(
                  toOutcome(() => {
                    provider.writeFile(virtualPath, content);
                    return provider.readFile(virtualPath);
                  }),
                );
                realTrace.push(
                  toOutcome(() => {
                    writeFileSync(realPath, content);
                    return readFileSync(realPath, "utf8");
                  }),
                );
              } else if (operation.kind === "read") {
                virtualTrace.push(toOutcome(() => provider.readFile(virtualPath)));
                realTrace.push(toOutcome(() => readFileSync(realPath, "utf8")));
              } else {
                virtualTrace.push(toOutcome(() => provider.exists(virtualPath)));
                realTrace.push(toOutcome(() => existsSync(realPath)));
              }
            }

            expect(virtualTrace).toStrictEqual(realTrace);
          },
          () => {
            provider.dispose();
            rmSync(directory, { force: true, recursive: true });
          },
        );
      }),
      { numRuns: 50 },
    );
  });
});
