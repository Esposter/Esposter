import type { VerifyPaths } from "#src/models/genshinParity/reference/VerifyPaths";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { verifyReference } from "#src/services/genshinParity/reference/verifyReference";
import { verifyReferences } from "#src/services/genshinParity/reference/verifyReferences";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// These checks return before any frame is cut, so they need no FFmpeg
describe(verifyReference, () => {
  const SOURCE = "recording.mp4 at 1s";
  const REFERENCE: ParityReference = { screen: "ArchiveScreen", source: SOURCE };
  let directory: string;
  let missingPath: string;
  let corruptPath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "parity-verify-reference-"));
    missingPath = join(directory, "missing.webp");
    corruptPath = join(directory, "corrupt.webp");
    writeFileSync(corruptPath, "not an image");
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  const pathsOf = (referencePath: string): VerifyPaths => ({
    capturesDirectory: directory,
    cutDirectory: directory,
    referencePath: () => Promise.resolve(referencePath),
  });

  test("fails a reference whose committed image is missing, naming the path to it", async () => {
    expect.hasAssertions();

    await expect(verifyReference("a", SOURCE, REFERENCE, pathsOf(missingPath))).resolves.toStrictEqual({
      id: "a",
      message: `no committed image at ${relative(REPOSITORY_ROOT, missingPath)}`,
      outcome: VerifyOutcome.Fail,
    });
  });

  test("fails a reference whose image cannot be read, rather than throwing out of the check", async () => {
    expect.hasAssertions();

    const verification = await verifyReference("b", SOURCE, REFERENCE, pathsOf(corruptPath));

    expect(verification.outcome).toBe(VerifyOutcome.Fail);
    expect(verification.message).toMatch(/^could not be checked: /u);
  });

  test("gives every other reference its verdict when one reference's check throws", async () => {
    expect.hasAssertions();

    expect(
      (
        await verifyReferences({ a: REFERENCE, b: REFERENCE }, directory, (referenceId) =>
          Promise.resolve(referenceId === "a" ? corruptPath : missingPath),
        )
      ).map(({ id, outcome }) => ({ id, outcome })),
    ).toStrictEqual([
      { id: "a", outcome: VerifyOutcome.Fail },
      { id: "b", outcome: VerifyOutcome.Fail },
    ]);
  });
});
