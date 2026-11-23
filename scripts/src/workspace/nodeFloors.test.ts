import { NPM_LOCKFILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getPackageJsonPaths } from "#src/services/shared/getPackageJsonPaths";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";

// The node floors a manifest carries: its `engines.node`, and the `node` runtime of its `devEngines`, in object or
// Array form
const readManifestFloors = (manifestPath: string): { path: string; value: string }[] => {
  const { devEngines, engines } = parseMachineJson<{
    devEngines?: { runtime?: { name: string; version: string } | { name: string; version: string }[] };
    engines?: { node?: string };
  }>(readFileSync(manifestPath, "utf8"));
  const runtimes = devEngines?.runtime === undefined ? [] : [devEngines.runtime].flat();
  const values = [engines?.node, ...runtimes.filter(({ name }) => name === "node").map(({ version }) => version)];
  return values.filter((value) => value !== undefined).map((value) => ({ path: manifestPath, value }));
};

// The root entry of an npm lockfile, whose `engines.node` `pnpm update:node` moves beside its manifest's
const readLockfileRootFloors = (lockfilePath: string): { path: string; value: string }[] => {
  const { packages } = parseMachineJson<{ packages: Record<string, { engines?: { node?: string } } | undefined> }>(
    readFileSync(lockfilePath, "utf8"),
  );
  const value = packages[""]?.engines?.node;
  return value === undefined ? [] : [{ path: lockfilePath, value }];
};

/**
 * `.node-version` is the one pin, and every node floor the repo states is its `>=` range: `pnpm update:node` writes the
 * floors and nothing else does, so a floor a bump left behind, or one written by hand, is a mismatch the build never
 * sees. The check names each file that disagrees with the pin.
 */
describe("nodeFloors", () => {
  test("every manifest floor and lockfile root is the pin's `>=` range", () => {
    expect.hasAssertions();

    const floor = `>=${readFileSync(resolve(REPOSITORY_ROOT, NODE_VERSION_FILENAME), "utf8").trim()}`;
    const floors = getPackageJsonPaths(REPOSITORY_ROOT).flatMap((manifestPath) => {
      const lockfilePath = join(dirname(manifestPath), NPM_LOCKFILE);
      return [
        ...readManifestFloors(manifestPath),
        ...(existsSync(lockfilePath) ? readLockfileRootFloors(lockfilePath) : []),
      ];
    });

    expect(
      floors
        .filter(({ value }) => value !== floor)
        .map(({ path, value }) => `${relative(REPOSITORY_ROOT, path)}: ${value}`),
    ).toStrictEqual([]);
  });
});
