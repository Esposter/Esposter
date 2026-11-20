import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";
import type { PackageManifest } from "@esposter/configuration";

import { getBuildDirectories } from "#src/services/worktree/create/getBuildDirectories";
import { describe, expect, test } from "vitest";

const createWorkspacePackage = (
  directory: string,
  workspaceDirectory: string,
  manifest: PackageManifest,
): WorkspacePackage => ({ directory, manifest, workspaceDirectory });

describe(getBuildDirectories, () => {
  test("builds the workspace packages the scripts package depends on that have a build, and no other", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", {
        dependencies: { built: "workspace:*", external: "^1.0.0" },
        devDependencies: { unbuilt: "workspace:*" },
        name: "@esposter/scripts",
      }),
      createWorkspacePackage("built", "packages", { name: "built", scripts: { build: "tsdown" } }),
      createWorkspacePackage("unbuilt", "packages", { name: "unbuilt" }),
      createWorkspacePackage("unrelated", "packages", { name: "unrelated", scripts: { build: "tsdown" } }),
    ];

    expect(getBuildDirectories(workspacePackages, [])).toStrictEqual(["built"]);
  });

  test("a named package builds its own directory", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", { dependencies: { built: "workspace:*" }, name: "@esposter/scripts" }),
      createWorkspacePackage("built", "packages", { name: "built", scripts: { build: "tsdown" } }),
      createWorkspacePackage("named", "packages", { name: "named", scripts: { build: "tsdown" } }),
    ];

    expect(getBuildDirectories(workspacePackages, ["named"])).toStrictEqual(["built", "named"]);
  });

  test("a named package with no build is walked through to its dependencies, and is not built itself", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", { dependencies: { built: "workspace:*" }, name: "@esposter/scripts" }),
      createWorkspacePackage("built", "packages", { name: "built", scripts: { build: "tsdown" } }),
      createWorkspacePackage("plugin", "packages", { dependencies: { built: "workspace:*" }, name: "plugin" }),
    ];

    expect(getBuildDirectories(workspacePackages, ["plugin"])).toStrictEqual(["built"]);
  });

  test("a named app builds the packages rather than itself", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", { dependencies: { built: "workspace:*" }, name: "@esposter/scripts" }),
      createWorkspacePackage("built", "packages", { name: "built", scripts: { build: "tsdown" } }),
      createWorkspacePackage("web", "apps", { name: "@esposter/web", scripts: { build: "nuxt build" } }),
    ];

    expect(getBuildDirectories(workspacePackages, ["@esposter/web"])).toStrictEqual(["built", "packages"]);
  });

  test("a package with no build is walked through to the builds it depends on", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", { dependencies: { middle: "workspace:*" }, name: "@esposter/scripts" }),
      createWorkspacePackage("middle", "packages", { dependencies: { deep: "workspace:*" }, name: "middle" }),
      createWorkspacePackage("deep", "packages", { name: "deep", scripts: { build: "tsdown" } }),
    ];

    expect(getBuildDirectories(workspacePackages, [])).toStrictEqual(["deep"]);
  });

  test("builds each package after the workspace packages it depends on", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", {
        dependencies: { a: "workspace:*", b: "workspace:*" },
        name: "@esposter/scripts",
      }),
      createWorkspacePackage("a", "packages", {
        dependencies: { b: "workspace:*" },
        name: "a",
        scripts: { build: "tsdown" },
      }),
      createWorkspacePackage("b", "packages", { name: "b", scripts: { build: "tsdown" } }),
    ];

    expect(getBuildDirectories(workspacePackages, [])).toStrictEqual(["b", "a"]);
  });

  test("a named package builds the workspace packages it depends on, not only the scripts package's", () => {
    expect.hasAssertions();

    const workspacePackages = [
      createWorkspacePackage("scripts", "", { dependencies: { built: "workspace:*" }, name: "@esposter/scripts" }),
      createWorkspacePackage("built", "packages", { name: "built", scripts: { build: "tsdown" } }),
      createWorkspacePackage("tool", "packages", {
        dependencies: { lib: "workspace:*" },
        name: "tool",
        scripts: { build: "tsdown" },
      }),
      createWorkspacePackage("lib", "packages", { name: "lib", scripts: { build: "tsdown" } }),
    ];

    expect(getBuildDirectories(workspacePackages, ["tool"])).toStrictEqual(["built", "lib", "tool"]);
  });
});
