import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { TEST_DIR } from "@/services/exec/util/constants.test";
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
});
