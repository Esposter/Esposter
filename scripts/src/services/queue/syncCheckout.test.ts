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

    syncCheckout(pushed, base, getCwd());

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

    syncCheckout(pushed, base, getCwd());

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

    syncCheckout(pushed, base, getCwd());

    expect(readSha("HEAD")).toBe(base);
    expect(readRoadmap()).toBe("1\0\n2\n3-local\n");
  });

  test("refuses an uncommitted edit when a commit that landed since the base touched the file", () => {
    expect.hasAssertions();

    const base = commitFile(ROADMAP, "1\n2\n3\n4\n5\n");
    const pushed = commitFile(ROADMAP, "one\n2\n3\n4\n5\n");
    switchTo(base);
    const landed = commitFile(ROADMAP, "1\n2\nthree\n4\n5\n");
    writeRoadmap("1\n2\nthree\n4\nfive\n");

    syncCheckout(pushed, base, getCwd());

    expect(readSha("HEAD")).toBe(landed);
    expect(readRoadmap()).toBe("1\n2\nthree\n4\nfive\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M roadmap\n");
  });
});
