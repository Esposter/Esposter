import { spawnGit } from "#src/services/shared/spawnGit";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(spawnGit, () => {
  const timeout = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
  let directory: string;

  beforeEach(() => {
    directory = realpathSync(mkdtempSync(join(tmpdir(), "spawn-git-")));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // The land retries a pull or push that returns a failed status, so a call that stalls must end the land at its bound
  // Rather than come back as a status it would wait out and retry, once for each attempt
  test("throws at its bound, naming the command, rather than returning a status the land would retry", () => {
    expect.hasAssertions();

    // The stand-in transport outlasts the bound, and its `#` comments out the host and the remote command git appends
    vi.stubEnv("GIT_SSH_COMMAND", "sleep 10 #");

    expect(() => spawnGit(["ls-remote", "ssh://a/"], directory, timeout)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Update, "git ls-remote ssh://a/", `ran past ${timeout} ms and was killed`).message}]`,
    );
  });
});
