import { SourceType } from "@/models/source/SourceType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { loadGitSource } from "@/services/source/loadGitSource";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(loadGitSource, () => {
  const backend = createNativeBackend();
  let origin = "";

  beforeAll(async () => {
    origin = await mkdtemp(join(tmpdir(), "sandbox-origin-"));
    await backend.exec("git init -b main", { cwd: origin, stdio: "pipe" });
    await writeFile(join(origin, "a.txt"), " ");
    await backend.exec("git add a.txt", { cwd: origin, stdio: "pipe" });
    await backend.exec(`git -c user.email=ci@example.com -c user.name=ci commit -m init`, {
      cwd: origin,
      stdio: "pipe",
    });
  });

  afterAll(async () => {
    await rm(origin, { force: true, recursive: true });
  });

  test("clones a repository into a temp directory", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadGitSource({ ref: "", repo: origin, type: SourceType.Git });

    await expect(readFile(join(cwd, "a.txt"), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("checks out the requested ref", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadGitSource({ ref: "main", repo: origin, type: SourceType.Git });

    await expect(readFile(join(cwd, "a.txt"), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("throws InvalidOperationError with git's stderr when the clone fails", async () => {
    expect.hasAssertions();

    const missing = join(tmpdir(), "sandbox-does-not-exist-xyz");
    const dest = await mkdtemp(join(tmpdir(), "sandbox-clone-"));
    // Reconstruct the expected message from a live `-q` clone of the same missing repo: stderr then
    // References only the source (known here), never the random dest, so the snapshot is exact on
    // Every platform without hard-coding git's wording.
    const { exitCode, stderr } = await backend.exec(`git clone -q --depth 1 ${missing} ${dest}`, {
      cwd: "",
      stdio: "pipe",
    });
    await rm(dest, { force: true, recursive: true });

    await expect(
      loadGitSource({ ref: "", repo: missing, type: SourceType.Git }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, missing, `git clone failed (exit ${exitCode}): ${stderr}`).message}]`,
    );
  });
});
