import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { syncCheckout } from "#src/services/queue/syncCheckout";
import { runGit } from "#src/services/shared/runGit";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(syncCheckout, () => {
  const { commitFile, getCwd, readSha, switchTo } = setupFixtureRepository();
  const ROADMAP = "roadmap";
  const readRoadmap = () => readFileSync(join(getCwd(), ROADMAP), "utf8");
  const writeRoadmap = (content: string) => writeFileSync(join(getCwd(), ROADMAP), content);

  test("syncs over an uncommitted edit on another line than the pushed change, keeping both", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\n2\n3\n4\n5\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    writeRoadmap("1\n2\n3\n4\nfive\n");

    syncCheckout(pushed, base, readSha("HEAD"), getCwd());

    expect(readSha("HEAD")).toBe(pushed);
    expect(readRoadmap()).toBe("one\n2\n3\n4\nfive\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M roadmap\n");
  });

  test("refuses an uncommitted edit that conflicts with the pushed change, changing nothing", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\n2\n3\n4\n5\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    writeRoadmap("uno\n2\n3\n4\n5\n");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    syncCheckout(pushed, base, readSha("HEAD"), getCwd());

    expect(info).toHaveBeenCalledWith(expect.stringContaining(ROADMAP));
    info.mockRestore();
    expect(readSha("HEAD")).toBe(base);
    expect(readRoadmap()).toBe("uno\n2\n3\n4\n5\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M roadmap\n");
  });

  test("refuses an uncommitted edit to a binary file, which has no lines to merge", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\0\n2\n3\n");
    const pushed = commitFile(ROADMAP, "one\0\n2\n3\n");
    switchTo(base);
    writeRoadmap("1\0\n2\n3-local\n");

    syncCheckout(pushed, base, readSha("HEAD"), getCwd());

    expect(readSha("HEAD")).toBe(base);
    expect(readRoadmap()).toBe("1\0\n2\n3-local\n");
  });

  test("carries a commit that landed during the push onto the pushed tip, keeping another session's uncommitted file", () => {
    expect.hasAssertions();

    const base = commitFile("other", "o\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    commitFile("notes", "landed\n");
    writeFileSync(join(getCwd(), "other"), "edited\n");

    syncCheckout(pushed, base, readSha("HEAD"), getCwd());

    expect(readSha("HEAD~1")).toBe(pushed);
    expect(runGit(["log", "--format=%s", "-1"], getCwd())).toBe("notes\n");
    expect(readFileSync(join(getCwd(), "other"), "utf8")).toBe("edited\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M other\n");
  });

  test("leaves the branch where it stands when a commit that landed during the push conflicts with the pushed tip", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\n2\n3\n4\n5\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    const landed = commitFile(ROADMAP, "uno\n2\n3\n4\n5\n");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    syncCheckout(pushed, base, readSha("HEAD"), getCwd());

    expect(info).toHaveBeenCalledWith(expect.stringContaining("waits"));
    info.mockRestore();
    expect(readSha("HEAD")).toBe(landed);
    expect(readRoadmap()).toBe("uno\n2\n3\n4\n5\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("leaves the branch alone when a commit lands between the head it reads and the reset", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\n2\n3\n4\n5\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    const head = readSha("HEAD");
    const landed = commitFile("notes", "landed\n");
    writeRoadmap("1\n2\n3\n4\nfive\n");

    syncCheckout(pushed, base, head, getCwd());

    expect(readSha("HEAD")).toBe(landed);
    expect(readRoadmap()).toBe("1\n2\n3\n4\nfive\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M roadmap\n");
  });

  test("syncs over an uncommitted edit to a file a landed commit changed, merging both sides", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\n2\n3\n4\n5\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    commitFile(ROADMAP, "1\n2\nthree\n4\n5\n");
    writeRoadmap("1\n2\nthree\n4\nfive\n");

    syncCheckout(pushed, base, readSha("HEAD"), getCwd());

    expect(readSha("HEAD~1")).toBe(pushed);
    expect(readRoadmap()).toBe("one\n2\nthree\n4\nfive\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M roadmap\n");
  });
});
