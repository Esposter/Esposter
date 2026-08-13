import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { getTarExecutable } from "@/services/exec/util/getTarExecutable";
import { readSourceMirrorArchiveMembers } from "@/services/exec/wsl/readSourceMirrorArchiveMembers";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(readSourceMirrorArchiveMembers, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  afterEach(cleanup);

  test("normalizes a stored name to the manifest's own path shape", () => {
    expect.hasAssertions();

    // Attribution reads a member's absence as "never archived" and prunes that path from the manifest, so a
    // `./` prefix tar was free to store would silently re-copy a file that is already mirrored, every run
    const cwd = create();
    const archivePath = join(create(), TEST_FILENAME);
    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
    execFileHidden(getTarExecutable(), ["-c", "--no-recursion", "-f", archivePath, "-C", cwd, `./${TEST_FILENAME}`]);

    expect(readSourceMirrorArchiveMembers(archivePath)).toStrictEqual([TEST_FILENAME]);
  });
});
