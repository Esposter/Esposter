import { SourceType } from "@/models/source/SourceType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { loadGitSource } from "@/services/source/loadGitSource";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(loadGitSource, () => {
  const backend = createNativeBackend();
  const temporaryDirectories = createTemporaryDirectoryTracker();
  const fileName = `${TEST_FILENAME}.txt`;
  let origin = "";

  beforeAll(async () => {
    origin = temporaryDirectories.create();
    await backend.exec("git init -b main", { cwd: origin, stdio: "pipe" });
    await writeFile(join(origin, fileName), " ");
    await backend.exec(`git add ${fileName}`, { cwd: origin, stdio: "pipe" });
    await backend.exec(`git -c user.email=ci@example.com -c user.name=ci commit -m init`, {
      cwd: origin,
      stdio: "pipe",
    });
  });

  afterAll(() => {
    temporaryDirectories.cleanup();
  });

  test("clones a repository into a temp directory", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadGitSource({ ref: "", repo: origin, type: SourceType.Git });

    await expect(readFile(join(cwd, fileName), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("checks out the requested ref", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadGitSource({ ref: "main", repo: origin, type: SourceType.Git });

    await expect(readFile(join(cwd, fileName), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("throws InvalidOperationError with git's stderr when the clone fails", async () => {
    expect.hasAssertions();

    // A guaranteed-missing local repo path (a nonexistent child of a fresh empty temp dir).
    const missingRepo = join(temporaryDirectories.create(), TEST_FILENAME);
    const destination = temporaryDirectories.create();
    // Reconstruct the expected message from a live `-q` clone of the same missing repo: stderr then
    // References only the source (known here), never the random destination, so the snapshot is exact on
    // Every platform without hard-coding git's wording.
    const { exitCode, stderr } = await backend.exec(
      ["git", "clone", "-q", "--depth", "1", "--", missingRepo, destination],
      { cwd: "", stdio: "pipe" },
    );

    await expect(
      loadGitSource({ ref: "", repo: missingRepo, type: SourceType.Git }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, missingRepo, `git clone failed (exit ${exitCode}): ${stderr}`).message}]`,
    );
  });
});
