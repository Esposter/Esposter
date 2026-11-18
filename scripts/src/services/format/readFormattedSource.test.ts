import { readFormattedSource } from "#src/services/format/readFormattedSource";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, onTestFinished, test } from "vitest";

describe(readFormattedSource, () => {
  test("reads no formatted source for a file type the formatter has no parser for, so a format pass skips it", () => {
    expect.hasAssertions();

    expect(readFormattedSource("apps/web/.env.example", REPOSITORY_ROOT, readMainCheckoutRoot())).toBeUndefined();
  });

  test("reads no formatted source for a link to a directory, so an installed skill's link never stops a format pass", () => {
    expect.hasAssertions();

    const repositoryRoot = mkdtempSync(join(tmpdir(), "readFormattedSource-"));
    onTestFinished(() => {
      rmSync(repositoryRoot, { force: true, recursive: true });
    });
    mkdirSync(join(repositoryRoot, "target"));
    symlinkSync(join(repositoryRoot, "target"), join(repositoryRoot, "link"), "junction");

    expect(readFormattedSource("link", repositoryRoot, readMainCheckoutRoot())).toBeUndefined();
  });
});
