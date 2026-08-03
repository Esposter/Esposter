import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { TEST_DIR, TEST_FILENAME } from "@/services/exec/util/constants.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildBwrapArgs, () => {
  test("wraps a string command in /bin/sh -c after the overlay flags", () => {
    expect.hasAssertions();

    expect(buildBwrapArgs("echo hi", TEST_DIR)).toStrictEqual([
      "--unshare-all",
      "--die-with-parent",
      "--ro-bind",
      "/",
      "/",
      "--dev",
      "/dev",
      "--proc",
      "/proc",
      "--tmpfs",
      "/tmp",
      "--overlay-src",
      TEST_DIR,
      "--tmp-overlay",
      TEST_DIR,
      "--chdir",
      TEST_DIR,
      "--",
      "/bin/sh",
      "-c",
      "echo hi",
    ]);
  });

  test("spreads an argv command unchanged so it is never reinterpreted by a shell", () => {
    expect.hasAssertions();

    const args = buildBwrapArgs(["git", "clone", "--", "; rm -rf /"], TEST_DIR);

    expect(args.slice(-4)).toStrictEqual(["git", "clone", "--", "; rm -rf /"]);
  });

  test("mounts the same dir as overlay source, upper, and chdir", () => {
    expect.hasAssertions();

    const args = buildBwrapArgs("pwd", TEST_DIR);

    expect(args).toContain("--overlay-src");
    expect(args.filter((arg) => arg === TEST_DIR)).toHaveLength(3);
  });

  test("falls back to the process cwd when the cwd is empty", () => {
    expect.hasAssertions();

    const args = buildBwrapArgs("pwd", "");

    expect(args).toContain(process.cwd());
  });

  test("re-adds the network namespace right after --unshare-all when network is on", () => {
    expect.hasAssertions();

    expect(buildBwrapArgs("pwd", TEST_DIR, { isNetworkEnabled: true }).slice(0, 2)).toStrictEqual([
      "--unshare-all",
      "--share-net",
    ]);
    expect(buildBwrapArgs("pwd", TEST_DIR).slice(0, 2)).toStrictEqual(["--unshare-all", "--die-with-parent"]);
  });

  test("binds writable host cache dirs after RAM overlays", () => {
    expect.hasAssertions();

    const bindDir = `${TEST_DIR}/${VIRRUN_CACHE_DIRECTORY_NAME}/${VIRRUN_STORE_DIRECTORY_NAME}/${VIRRUN_PNPM_STORE_DIRECTORY_NAME}`;
    const args = buildBwrapArgs("pwd", TEST_DIR, { bindDirs: [bindDir] });

    expect(args).toStrictEqual(
      expect.arrayContaining(["--overlay-src", TEST_DIR, "--tmp-overlay", TEST_DIR, "--bind", bindDir, bindDir]),
    );
    expect(args.indexOf("--bind")).toBeGreaterThan(args.indexOf("--tmp-overlay"));
    expect(args.indexOf("--chdir")).toBeGreaterThan(args.indexOf("--bind"));
  });

  test("persists writes to a host upper when capturing a snapshot", () => {
    expect.hasAssertions();

    const upperDir = `${TEST_DIR}/upper`;
    const workDir = `${TEST_DIR}/work`;
    const args = buildBwrapArgs("pnpm install", TEST_DIR, {}, { upperDir, workDir });

    expect(args).toStrictEqual(
      expect.arrayContaining(["--overlay-src", TEST_DIR, "--overlay", upperDir, workDir, TEST_DIR]),
    );
    expect(args).not.toContain("--tmp-overlay");
  });

  test("stacks extra lower layers above the source before the tmpfs upper when forking", () => {
    expect.hasAssertions();

    const snapshotUpper = `${TEST_DIR}/${TEST_FILENAME}`;
    const args = buildBwrapArgs("vitest", TEST_DIR, {}, { lowerDirs: [snapshotUpper] });
    const sourceLower = args.indexOf(TEST_DIR);
    const snapshotLower = args.indexOf(snapshotUpper);

    expect(args).toStrictEqual(
      expect.arrayContaining(["--overlay-src", TEST_DIR, "--overlay-src", snapshotUpper, "--tmp-overlay", TEST_DIR]),
    );
    // The snapshot lower must stack after the source so its files shadow it, and both precede the upper.
    expect(snapshotLower).toBeGreaterThan(sourceLower);
    expect(args.indexOf("--tmp-overlay")).toBeGreaterThan(snapshotLower);
  });

  test("overlays a distinct sourceDir as the lower while mounting and chdiring at cwd", () => {
    expect.hasAssertions();

    const mirror = `${TEST_DIR}/${TEST_FILENAME}`;
    const args = buildBwrapArgs("pwd", TEST_DIR, {}, {}, mirror);

    // The source content comes from the mirror, but the overlay is mounted at — and the sandbox chdir's into — cwd,
    // So pwd reports the logical path, not the mirror's.
    expect(args).toStrictEqual(
      expect.arrayContaining(["--overlay-src", mirror, "--tmp-overlay", TEST_DIR, "--chdir", TEST_DIR]),
    );
    // The lone source lower is the mirror, not cwd — otherwise pwd would leak the mirror path.
    expect(takeOne(args, args.indexOf("--overlay-src") + 1)).toBe(mirror);
  });

  test("throws when only one of upperDir or workDir is supplied", () => {
    expect.hasAssertions();

    expect(() => buildBwrapArgs("pwd", TEST_DIR, {}, { upperDir: `${TEST_DIR}/upper` })).toThrow(
      "a persistent overlay needs both upperDir and workDir",
    );
    expect(() => buildBwrapArgs("pwd", TEST_DIR, {}, { workDir: `${TEST_DIR}/work` })).toThrow(
      "a persistent overlay needs both upperDir and workDir",
    );
  });
});
