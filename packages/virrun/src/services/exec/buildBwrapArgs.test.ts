import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/constants";
import { describe, expect, test } from "vitest";

describe(buildBwrapArgs, () => {
  test("wraps a string command in /bin/sh -c after the overlay flags", () => {
    expect.hasAssertions();

    expect(buildBwrapArgs("echo hi", "/work")).toStrictEqual([
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
      "/work",
      "--tmp-overlay",
      "/work",
      "--chdir",
      "/work",
      "--",
      "/bin/sh",
      "-c",
      "echo hi",
    ]);
  });

  test("spreads an argv command unchanged so it is never reinterpreted by a shell", () => {
    expect.hasAssertions();

    const args = buildBwrapArgs(["git", "clone", "--", "; rm -rf /"], "/work");

    expect(args.slice(-4)).toStrictEqual(["git", "clone", "--", "; rm -rf /"]);
  });

  test("mounts the same dir as overlay source, upper, and chdir", () => {
    expect.hasAssertions();

    const args = buildBwrapArgs("pwd", "/work");

    expect(args).toContain("--overlay-src");
    expect(args.filter((arg) => arg === "/work")).toHaveLength(3);
  });

  test("falls back to the process cwd when the cwd is empty", () => {
    expect.hasAssertions();

    const args = buildBwrapArgs("pwd", "");

    expect(args).toContain(process.cwd());
  });

  test("re-adds the network namespace right after --unshare-all when network is on", () => {
    expect.hasAssertions();

    expect(buildBwrapArgs("pwd", "/work", { isNetworkEnabled: true }).slice(0, 2)).toStrictEqual([
      "--unshare-all",
      "--share-net",
    ]);
    expect(buildBwrapArgs("pwd", "/work").slice(0, 2)).toStrictEqual(["--unshare-all", "--die-with-parent"]);
  });

  test("binds writable host cache dirs after RAM overlays", () => {
    expect.hasAssertions();

    const bindDir = `/work/${VIRRUN_CACHE_DIRECTORY_NAME}/${VIRRUN_STORE_DIRECTORY_NAME}/${VIRRUN_PNPM_STORE_DIRECTORY_NAME}`;
    const args = buildBwrapArgs("pwd", "/work", { bindDirs: [bindDir] });

    expect(args).toStrictEqual(
      expect.arrayContaining(["--overlay-src", "/work", "--tmp-overlay", "/work", "--bind", bindDir, bindDir]),
    );
    expect(args.indexOf("--bind")).toBeGreaterThan(args.indexOf("--tmp-overlay"));
    expect(args.indexOf("--chdir")).toBeGreaterThan(args.indexOf("--bind"));
  });
});
