import type { MockInstance } from "vitest";

import { printDirectoryFiles } from "#src/services/fleet/data/commands/printDirectoryFiles";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(printDirectoryFiles, () => {
  const EXTRACTED = "extracted/login";
  const OUTSIDE = "../outside";

  let info: MockInstance<typeof console.info>;
  let parityDirectory: string;
  let rootDirectory: string;

  // The lines the listing printed, one per directory
  const printed = (): string[] => info.mock.calls.map(([line]) => String(line));

  beforeEach(() => {
    rootDirectory = mkdtempSync(join(tmpdir(), "print-directory-files-"));
    parityDirectory = join(rootDirectory, "parity");
    mkdirSync(join(parityDirectory, EXTRACTED), { recursive: true });
    mkdirSync(join(rootDirectory, "outside"));
    info = vi.spyOn(console, "info").mockReturnValue(undefined);
  });

  afterEach(() => {
    info.mockRestore();
    rmSync(rootDirectory, { force: true, recursive: true });
  });

  test("refuses a directory that climbs out of the parity directory before printing any", async () => {
    expect.hasAssertions();

    await expect(printDirectoryFiles(parityDirectory, [EXTRACTED, OUTSIDE])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, OUTSIDE, "is not a directory inside the parity directory").message}]`,
    );
    expect(printed()).toStrictEqual([]);
  });

  test("prints a directory inside the parity directory", async () => {
    expect.hasAssertions();

    await printDirectoryFiles(parityDirectory, [EXTRACTED]);

    expect(printed()).toStrictEqual([JSON.stringify({ directory: EXTRACTED, files: [] })]);
  });
});
