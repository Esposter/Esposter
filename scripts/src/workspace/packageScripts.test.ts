import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("packageScripts", () => {
  // The commands pnpm owns: a script sharing one of these names is the one place `run` changes what executes, since
  // Bare it would run pnpm's command instead. The list is pnpm's vocabulary rather than the repo's
  const PNPM_COMMANDS = new Set([
    "add",
    "audit",
    "bin",
    "config",
    "dedupe",
    "deploy",
    "dlx",
    "exec",
    "fetch",
    "import",
    "init",
    "install",
    "link",
    "list",
    "outdated",
    "pack",
    "patch",
    "prune",
    "publish",
    "rebuild",
    "remove",
    "root",
    "setup",
    "store",
    "unlink",
    "update",
    "why",
  ]);
  // A `pnpm` call reaching `run` through any flags (`-C dir`, `--filter pkg`, `-r`), and the script it names
  const PNPM_RUN_REGEX = /\bpnpm(?:\s+(?:-C|--dir|--filter|-F)\s+\S+|\s+-[-\w=]+)*\s+run\s+(?<script>[^\s&;|]+)/gu;
  // Every manifest's scripts, the root's included, each named by its manifest so a failure says where it is
  const scripts = ["", ...readWorkspacePackageDirectories(REPOSITORY_ROOT)].flatMap((packagePath) => {
    const manifestPath = join(packagePath, PACKAGE_JSON_FILENAME).replaceAll("\\", "/");
    const { scripts: manifestScripts = {} } = readJsonFile(join(REPOSITORY_ROOT, manifestPath)) as {
      scripts?: Record<string, string>;
    };
    return Object.entries(manifestScripts).map(([name, body]) => ({ body, manifestPath, name }));
  });

  test("invoke a script bare, never through `run`", () => {
    expect.hasAssertions();

    const runInvocations = scripts.flatMap(({ body, manifestPath, name }) =>
      Array.from(body.matchAll(PNPM_RUN_REGEX), (match) => match.groups?.script ?? "")
        .filter((script) => !PNPM_COMMANDS.has(script))
        .map((script) => `${manifestPath} ${name}: pnpm run ${script}`),
    );

    expect(runInvocations).toStrictEqual([]);
  });

  test("hold no comment key, which pnpm lists as runnable", () => {
    expect.hasAssertions();

    const commentKeys = scripts
      .filter(({ name }) => name.startsWith("//"))
      .map(({ manifestPath, name }) => `${manifestPath} ${name}`);

    expect(commentKeys).toStrictEqual([]);
  });
});
