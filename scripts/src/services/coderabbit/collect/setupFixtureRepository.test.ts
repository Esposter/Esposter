import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, vi } from "vitest";

const EPOCH = new Date(0).toISOString();

// A real repository per test — a bare `origin` and one clone whose `main` is published — so the porter, the fold
// And the lanes are proved against git itself rather than against a transcript of what git would say. The
// Getters answer for the current test: the hooks rebuild the pair before each and remove it after. Every commit
// Is dated at the epoch, so a sha is a function of its content and a message naming one can be snapshotted.
export const setupFixtureRepository = (): {
  commitFile: (path: string, content: string) => string;
  commitFiles: (paths: string[], content: string) => string;
  deleteFile: (path: string) => string;
  getCwd: () => string;
  installPreReceiveHook: (script: string) => void;
  moveFile: (from: string, to: string) => string;
  publish: (branch: string, ref: string) => string;
  readSha: (ref: string) => string;
  switchTo: (ref: string) => void;
} => {
  let directory: string;
  let cwd: string;
  let origin: string;

  beforeEach(() => {
    vi.stubEnv("GIT_AUTHOR_DATE", EPOCH);
    vi.stubEnv("GIT_COMMITTER_DATE", EPOCH);
    directory = mkdtempSync(join(tmpdir(), "review-collector-fixture-"));
    cwd = join(directory, "clone");
    origin = join(directory, "origin.git");
    runGit(["init", "--quiet", "--bare", "--initial-branch", MAIN_BRANCH, origin]);
    runGit(["init", "--quiet", "--initial-branch", MAIN_BRANCH, cwd]);
    runGit(["config", "user.name", "fixture"], cwd);
    runGit(["config", "user.email", "fixture@example.com"], cwd);
    // A signature is part of the commit object, so a machine that signs by default would hash every fixture
    // Commit differently from the shas the snapshots hold
    runGit(["config", "commit.gpgsign", "false"], cwd);
    runGit(["remote", "add", "origin", origin], cwd);
    commitFile(".gitignore", "");
    publish(MAIN_BRANCH, "HEAD");
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  const readSha = (ref: string): string => runGit(["rev-parse", ref], cwd).trim();
  // Every commit is titled by the paths it touches — a subject is never read, so it carries nothing else
  const commitFiles = (paths: string[], content: string): string => {
    for (const path of paths) {
      mkdirSync(dirname(join(cwd, path)), { recursive: true });
      writeFileSync(join(cwd, path), content);
    }
    runGit(["add", "--all"], cwd);
    runGit(["commit", "--quiet", "--message", paths.join(" ")], cwd);
    return readSha("HEAD");
  };
  const commitFile = (path: string, content: string): string => commitFiles([path], content);
  const deleteFile = (path: string): string => {
    runGit(["rm", "--quiet", path], cwd);
    runGit(["commit", "--quiet", "--message", path], cwd);
    return readSha("HEAD");
  };
  const moveFile = (from: string, to: string): string => {
    mkdirSync(dirname(join(cwd, to)), { recursive: true });
    runGit(["mv", from, to], cwd);
    runGit(["commit", "--quiet", "--message", to], cwd);
    return readSha("HEAD");
  };
  // Publishing is what gives a branch its `origin/<branch>` ref, which is the only form the collector reads
  const publish = (branch: string, ref: string): string => {
    runGit(["push", "--quiet", "origin", `${ref}:refs/heads/${branch}`], cwd);
    return readSha(`origin/${branch}`);
  };
  const switchTo = (ref: string): void => {
    runGit(["switch", "--quiet", "--detach", ref], cwd);
  };
  // What `origin` does while a push is in flight — the one moment a real remote can be made to move or refuse
  const installPreReceiveHook = (script: string): void => {
    writeFileSync(
      join(origin, "hooks", "pre-receive"),
      `#!/bin/sh
${script}
`,
      { mode: 0o755 },
    );
  };

  return {
    commitFile,
    commitFiles,
    deleteFile,
    getCwd: () => cwd,
    installPreReceiveHook,
    moveFile,
    publish,
    readSha,
    switchTo,
  };
};

describe.todo("setupFixtureRepository");
