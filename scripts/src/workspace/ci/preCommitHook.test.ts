import { NODE_MODULES_DIRECTORY } from "#src/services/dependencies/score/constants";
import { HOOKS_PATH } from "#src/services/setup/constants";
import { OXFMT_CONFIGURATION_FILE, REPOSITORY_ROOT, VITE_CONFIGURATION_FILE } from "#src/services/shared/constants";
import { execFileSync } from "@esposter/shared-node/child-process";
import { copyFileSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const runGit = (root: string, args: string[]): string =>
  execFileSync("git", ["-c", "commit.gpgsign=false", ...args], { cwd: root, encoding: "utf8" });

// A file whose two declarations are both unformatted at the end, so a format pass that reaches either one is visible.
// The first is the staged hunk; the last is the unstaged one.
describe("pre-commit hook", () => {
  const FILE_NAME = "module.ts";
  const HOOKS_DIRECTORY = join(REPOSITORY_ROOT, HOOKS_PATH);
  let root: string;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "pre-commit-hook-")));
    runGit(root, ["init", "--quiet"]);
    runGit(root, ["config", "user.email", "hook@example.com"]);
    runGit(root, ["config", "user.name", "Hook"]);
    runGit(root, ["config", "core.hooksPath", HOOKS_DIRECTORY]);
    copyFileSync(join(REPOSITORY_ROOT, OXFMT_CONFIGURATION_FILE), join(root, OXFMT_CONFIGURATION_FILE));
    symlinkSync(join(REPOSITORY_ROOT, NODE_MODULES_DIRECTORY), join(root, NODE_MODULES_DIRECTORY), "junction");
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("a commit of a partly staged file takes the staged hunk formatted and leaves the unstaged hunk out", () => {
    expect.hasAssertions();

    const formatted = "export const first = 1;\n\nexport const last = 3;\n";
    writeFileSync(join(root, FILE_NAME), formatted);
    runGit(root, ["add", FILE_NAME]);
    runGit(root, ["commit", "--no-verify", "--quiet", "-m", "initial"]);

    // The first declaration is staged unformatted; the last one is edited in the working copy and not staged
    writeFileSync(join(root, FILE_NAME), "export const first=10;\n\nexport const last = 3;\n");
    runGit(root, ["add", FILE_NAME]);
    writeFileSync(join(root, FILE_NAME), "export const first=10;\n\nexport const last=30;\n");
    runGit(root, ["commit", "--quiet", "-m", "staged hunk only"]);

    // The commit holds the staged hunk, formatted, and not the unstaged one
    expect(runGit(root, ["show", `HEAD:${FILE_NAME}`])).toBe("export const first = 10;\n\nexport const last = 3;\n");
    // The unstaged hunk is still unstaged, and the working copy keeps it as it was written
    expect(runGit(root, ["diff", "--name-only"])).toBe(`${FILE_NAME}\n`);
    expect(readFileSync(join(root, FILE_NAME), "utf8")).toBe("export const first = 10;\n\nexport const last=30;\n");
  });

  // A component's staged copy reaches vize through `formatComponent.ts`, since vize's command line reads no stdin
  test("a commit of a partly staged component takes the staged hunk formatted and leaves the unstaged hunk out", () => {
    expect.hasAssertions();

    const componentName = "Component.vue";
    const getComponent = (script: string, template: string) =>
      `<script setup lang="ts">\n${script}\n</script>\n\n<template>\n  ${template}\n</template>\n`;
    writeFileSync(join(root, VITE_CONFIGURATION_FILE), "export default {};\n");
    writeFileSync(join(root, componentName), getComponent("const a = 1;", "<div>{{ a }}</div>"));
    runGit(root, ["add", componentName]);
    runGit(root, ["commit", "--no-verify", "--quiet", "-m", "initial"]);

    writeFileSync(join(root, componentName), getComponent("const a=10;", "<div>{{ a }}</div>"));
    runGit(root, ["add", componentName]);
    writeFileSync(join(root, componentName), getComponent("const a=10;", "<div>{{a}}</div>"));
    runGit(root, ["commit", "--quiet", "-m", "staged hunk only"]);

    expect(runGit(root, ["show", `HEAD:${componentName}`])).toBe(getComponent("const a = 10;", "<div>{{ a }}</div>"));
    expect(readFileSync(join(root, componentName), "utf8")).toBe(getComponent("const a = 10;", "<div>{{a}}</div>"));
  });
});
