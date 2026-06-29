import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { createPlatformaticFsProvider } from "@/services/vfs/createPlatformaticFsProvider";
import { getResult } from "@esposter/shared";
import { array, assert, constant, constantFrom, oneof, property, record } from "fast-check";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
describe(createPlatformaticFsProvider, () => {
  const temporaryDirectories = createTemporaryDirectoryTracker();
  const providers: ReturnType<typeof createPlatformaticFsProvider>[] = [];
  // Absolute virtual root the provider operates under (POSIX-style; the provider's fs is virtual, not host-disk).
  const VROOT = "/p";
  // A pre-created sub-directory plus the never-written paths ("z", "d/z") that exercise the missing-file branch.
  const fileArb = constantFrom("f", "g", "d/f", "d/g", "z", "d/z");
  // Canonical diff values: "" as the base, " " as a distinct second value.
  const contentArb = constantFrom("", " ");
  const operationArb = oneof(
    record({ content: contentArb, kind: constant("write"), rel: fileArb }),
    record({ kind: constant("read"), rel: fileArb }),
    record({ kind: constant("exists"), rel: fileArb }),
  );

  afterEach(() => {
    for (const provider of providers.splice(0)) provider.dispose();
    temporaryDirectories.cleanup();
  });

  test("randomized read/write/exists sequences match node:fs exactly", () => {
    expect.hasAssertions();

    assert(
      property(array(operationArb, { maxLength: 48, minLength: 1 }), (operations) => {
        const provider = createPlatformaticFsProvider();
        providers.push(provider);
        const directory = temporaryDirectories.create();
        provider.mkdir(`${VROOT}/d`);
        mkdirSync(join(directory, "d"), { recursive: true });

        for (const operation of operations) {
          const virtualPath = `${VROOT}/${operation.rel}`;
          const realPath = join(directory, operation.rel);
          if (operation.kind === "write") {
            provider.writeFile(virtualPath, operation.content);
            writeFileSync(realPath, operation.content);
            expect(provider.readFile(virtualPath)).toBe(readFileSync(realPath, "utf8"));
          } else if (operation.kind === "read") {
            const virtualResult = getResult(() => provider.readFile(virtualPath));
            const realResult = getResult(() => readFileSync(realPath, "utf8"));
            expect(virtualResult.isOk()).toBe(realResult.isOk());
            if (virtualResult.isOk() && realResult.isOk()) expect(virtualResult.value).toBe(realResult.value);
          } else expect(provider.exists(virtualPath)).toBe(existsSync(realPath));
        }
      }),
      { numRuns: 50 },
    );
  });
});
